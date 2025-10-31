const PORT_NAME = "ce432752-e63a-4b01-bd73-8cb005df9212"
const CONTEXT_ITEM_PARENT_ID = "xport-context-item-parent"
const ABORT_MESSAGE = "Aborted by user"
enum Action {
  START_PROCESSING = "START_PROCESSING",
  UPDATE_PROGRESS_MESSAGE = "UPDATE_PROGRESS_MESSAGE",
  UPDATE_FIELD_STATUS = "UPDATE_FIELD_STATUS",
  DONE = "DONE",
  CANCEL = "CANCEL",
  ERROR = "ERROR"
}

type AiType = "object" | "array" | "string" | "number" | "boolean"
interface StartProcessingMessage {
  action: Action.START_PROCESSING
  content: {
    files: UserFile[]
    form: FormSchema
  }
}
interface UpdateProgressMessage {
  action: Action.UPDATE_PROGRESS_MESSAGE
  content: string
}
interface UpdateFieldStatusMessage {
  action: Action.UPDATE_FIELD_STATUS
  content: { fieldId: string; fieldName: string; fieldValue: AiType }
}
interface DoneMessage {
  action: Action.DONE
  content: { [key: string]: any }
}
interface ErrorMessage {
  action: Action.ERROR
  content: string
}
interface CancelMessage {
  action: Action.CANCEL
  content: string
}
type Message =
  | StartProcessingMessage
  | UpdateProgressMessage
  | UpdateFieldStatusMessage
  | DoneMessage
  | CancelMessage
interface UserFile {
  name: string
  type: "image/jpeg" | "image/png"
  size: number // Size in bytes
  data: { [key: number]: number } // Chrome converts Uint8Array to an object when sending messages
}
interface FormSchema {
  type: "object"
  properties: {
    [key: string]: {
      type: AiType
      description?: string
    }
  }
  required: string[]
  additionalProperties: boolean
}

interface AiSchema {
  type: "object"
  properties: {
    [key: string]: {
      type: "object"
      properties: {
        displayName: {
          type: "string"
          description: string
        }
        extractedValue: {
          type: AiType
          description?: string
        }
      }
      required: ["displayName", "extractedValue"]
      additionalProperties: false
    }
  }
  required: string[]
  additionalProperties: false
}

interface AiFinalResult {
  [fieldId: string]: {
    name: string
    value: AiType | null
  }
}

// --- Create context menu ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: CONTEXT_ITEM_PARENT_ID,
    title: "Fill from...",
    contexts: ["all"]
  })
  console.log("⚙️ Context menu item created.")
})

// --- On context menu item clicked ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || info.menuItemId !== CONTEXT_ITEM_PARENT_ID) return
  console.log("👆 Context menu item clicked. Injecting content script...")
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["modal.css"]
  })
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["modal.js"]
  })
})

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME) return
  port.onMessage.addListener(async (message: StartProcessingMessage) => {
    if (message.action === Action.START_PROCESSING) {
      await processFiles(port, message.content.form, message.content.files)
    }
  })
})

function sendMessage<Message>(port: chrome.runtime.Port, message: Message) {
  console.log("➡️ Sending message to port:", message)
  port.postMessage(message)
}

async function getFinalResult(
  stream: AsyncIterable<string | object>,
  aiSchema: AiSchema,
  port: chrome.runtime.Port
): Promise<AiFinalResult> {
  let buffer = ""
  const MAX_BUFFER = 8 * 1024 // keep last 8KB for context
  const expectedFields = Object.keys(aiSchema.properties || {})
  const reportedFields = new Map<string, boolean>()
  let finalResult: AiFinalResult = {}

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  for await (const chunk of stream) {
    try {
      const text = typeof chunk === "string" ? chunk : JSON.stringify(chunk)
      buffer += text
      if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER)
  
      // --- check each field individually ---
      for (const fieldId of expectedFields) {
        const keyRe = new RegExp(`"${escapeRegex(fieldId)}"\\s*:\\s*({[^}]*})`, "i")
        const match = buffer.match(keyRe)
        if (match) {
          try {
            const fieldObj = JSON.parse(match[1])
            console.log("[DEBUG]", fieldObj)
            const displayName = fieldObj.displayName ?? ""
            const extractedValue = fieldObj.extractedValue ?? null

            finalResult[fieldId] = { name: displayName, value: extractedValue }

            // send runtime update if not already reported
            if (!reportedFields.has(fieldId)) {
              reportedFields.set(fieldId, true)
              sendMessage<UpdateFieldStatusMessage>(port, {
                action: Action.UPDATE_FIELD_STATUS,
                content: { fieldId, fieldName: displayName, fieldValue: extractedValue }
              })
            }

            // remove matched part from buffer
            const endIndex = buffer.indexOf(match[0]) + match[0].length
            buffer = buffer.slice(endIndex)
          } catch (err) {
            console.warn(`⚠️ Could not parse field object for ${fieldId}:`, err)
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Error handling chunk:", err)
    }
  }

  // final parse for remaining buffer (in case some fields weren't fully reported)
  try {
    const first = buffer.indexOf("{")
    const last = buffer.lastIndexOf("}")
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = buffer.slice(first, last + 1)
      const parsed = JSON.parse(candidate)
      for (const [fieldId, fieldObj] of Object.entries(parsed)) {
        const displayName = (fieldObj as any).displayName
        const extractedValue = (fieldObj as any).extractedValue
        finalResult[fieldId] = { name: displayName, value: extractedValue }

        if (!reportedFields.has(fieldId) && extractedValue !== null) {
          reportedFields.set(fieldId, true)
          sendMessage<UpdateFieldStatusMessage>(port, {
            action: Action.UPDATE_FIELD_STATUS,
            content: { fieldId, fieldName: displayName, fieldValue: extractedValue }
          })
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not parse final buffer:", err)
  }

  return finalResult
}

async function processFiles(
  port: chrome.runtime.Port,
  form: FormSchema,
  userFiles: UserFile[]
) {
  if (
    !form?.properties ||
    Object.keys(form.properties).length === 0 ||
    userFiles.length === 0
  )
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "No form schema or files provided for processing."
    })

  let onPortMsg: ((m: any) => void) | undefined = undefined

  try {
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: `Preparing ${userFiles.length} file(s) for AI processing...`
    })
    const files = await Promise.all(
      userFiles.map((f) => {
        const uint8 = new Uint8Array(Object.values(f.data))
        return new File([uint8], f.name, { type: f.type })
      })
    )

    const aiSchema = toAiSchema(form)

    // --- Call Chrome's built-in generative AI API ---
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "Starting AI model..."
    })
    const SYSTEM_PROMPT = `You are a strict and careful data extraction tool.
- Your only task is to extract values from the IMAGE.
- It is FORBIDDEN to make up values.
- If a field's value IS NOT VISIBLE IN THE IMAGE, the corresponding value is the keyword <NULL>.
- Output JSON that exactly matches the provided schema.
- IMPORTANT: The displayName should be a formatted version of the key being populated.
`
    // @ts-ignore - Chrome's built-in AI API
    const session = await LanguageModel.create({
      systemPrompt: SYSTEM_PROMPT,
      expectedInputs: [{ type: "image" }]
    })
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: `Sending ${files.length} file(s) for processing...`
    })
    const messages = files.map((file) => ({
      role: "user",
      content: [
        { type: "text", value: `This is the image with name: ${file.name}` },
        { type: "image", value: file }
      ]
    }))
    await session.append(messages)

    // --- Process the response stream ---
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "AI model is processing the files..."
    })
    const controller = new AbortController()
    onPortMsg = (message: Message) => {
      try {
        if (message.action === Action.CANCEL) {
          try {
            controller.abort(ABORT_MESSAGE)
          } catch (e) {
            console.warn("⚠️ Error aborting controller:", e)
          }
        }
      } catch (e) {
        console.warn("⚠️ Error in onPortMsg handler:", e)
      }
    }
    if (onPortMsg) port.onMessage.addListener(onPortMsg)
    console.log("[DEBUG]", aiSchema)
    const stream = await session.promptStreaming(
      "Proceed with the extraction of information.",
      {
        signal: controller.signal,
        responseConstraint: aiSchema
      }
    )
    const result = await getFinalResult(stream, aiSchema, port)
    sendMessage<DoneMessage>(port, {
      action: Action.DONE,
      content: result
    })
  } catch (err) {
    if (String(err) !== ABORT_MESSAGE) {
      console.log("❌ Error during AI processing:", err)
      sendMessage<ErrorMessage>(port, {
        action: Action.ERROR,
        content: err
      })
    }
  } finally {
    try {
      if (onPortMsg) port.onMessage.removeListener(onPortMsg)
      port.disconnect()
    } catch (e) {
      console.warn("⚠️ Error removing onPortMsg listener:", e)
    }
  }
}

function toAiSchema(formSchema: FormSchema): AiSchema {
  const aiSchema: AiSchema = {
    type: "object",
    properties: {},
    required: formSchema.required || Object.keys(formSchema.properties),
    additionalProperties: false
  }

  for (const [key, field] of Object.entries(formSchema.properties)) {
    aiSchema.properties[key] = {
      type: "object",
      properties: {
        displayName: {
          type: "string",
          description: `IMPORTANT: Format the following field id into human readable words: ${key}. For example: 'expenseCategory' can become 'Expense Category'` 
        },
        extractedValue: {
          type: field.type,
          description: `The value extracted from the image. Description ${field.description}`
        }
      },
      required: ["displayName", "extractedValue"],
      additionalProperties: false
    }
  }

  return aiSchema
}
