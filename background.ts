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
interface StartProcessingMessage {
  action: Action.START_PROCESSING
  content: {
    files: UserFile[]
    form: Schema
  }
}
interface UpdateProgressMessage {
  action: Action.UPDATE_PROGRESS_MESSAGE
  content: string
}
interface UpdateFieldStatusMessage {
  action: Action.UPDATE_FIELD_STATUS
  content: { field: string; value: "object" | "array" | "string" | "number" | "boolean" }
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
interface Schema {
  type: "object" | "array" | "string" | "number" | "boolean"
  properties: {
    [key: string]: {
      type: "object" | "array" | "string" | "number" | "boolean"
      description?: string
    }
  }
  required: string[]
  additionalProperties: boolean
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
  form: Schema,
  port: chrome.runtime.Port
) {
  let buffer = ""
  const MAX_BUFFER = 8 * 1024 // keep last 8KB of stream to allow reassembly across chunks
  const expectedFields = Object.keys(form.properties || {})
  const reportedFields = new Map<string, boolean>()
  let finalResult: { [k: string]: any } = {}

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  for await (const chunk of stream) {
    try {
      const text = typeof chunk === "string" ? chunk : JSON.stringify(chunk)
      buffer += text
      // cap rolling buffer so it doesn't grow without bound but keeps recent context
      if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER)

      // quick scan: look for key:value pairs for expected fields in the
      for (const k of expectedFields) {
        // strict key:value detection (string/null/number) — report as soon as present
        const keyRe = new RegExp(
          `(?:"${escapeRegex(k)}"|'${escapeRegex(k)}'|\\b${escapeRegex(k)}\\b)\\s*:\\s*(?:"([^"]*)"|'([^']*)'|(null)|(true|false)|(-?\\d+(?:\\.\\d+)?))`,
          "i"
        )
        const m = buffer.match(keyRe)
        if (m) {
          let val: any = null
          if (m[1] !== undefined) val = m[1]
          else if (m[2] !== undefined) val = m[2]
          else if (m[3] !== undefined) val = null
          else if (m[4] !== undefined) val = m[4].toLowerCase() === "true"
          else if (m[5] !== undefined) {
            const num = Number(m[5])
            val = Number.isFinite(num) ? num : m[5]
          }
          const hasValue = val !== null && val !== "" && val !== undefined
          const prev = reportedFields.get(k)
          if (hasValue && (prev === undefined || prev !== hasValue)) {
            reportedFields.set(k, hasValue)
            sendMessage<UpdateFieldStatusMessage>(port, {
              action: Action.UPDATE_FIELD_STATUS,
              content: { field: k, value: val }
            })
          }
          finalResult[k] = val
        }
      }

      // fallback: try to extract a JSON substring from buffer
      const first = buffer.indexOf("{")
      const last = buffer.lastIndexOf("}")
      if (first !== -1 && last !== -1 && last > first) {
        const candidate = buffer.slice(first, last + 1)
        try {
          const parsed = JSON.parse(candidate)
          // merge parsed into finalResult (shallow merge)
          Object.keys(parsed).forEach((k) => {
            const val = parsed[k]
            // determine if field has a meaningful value
            const hasValue = val !== null && val !== "" && val !== undefined
            const prev = reportedFields.get(k)
            // if field appears for the first time, report its state (true or false)
            if (prev === undefined && hasValue) {
              reportedFields.set(k, hasValue)
              sendMessage<UpdateFieldStatusMessage>(port, {
                action: Action.UPDATE_FIELD_STATUS,
                content: { field: k, value: val }
              })
            } else if (!prev && hasValue) {
              // previously reported as not found, now found -> update
              reportedFields.set(k, true)
              sendMessage<UpdateFieldStatusMessage>(port, {
                action: Action.UPDATE_FIELD_STATUS,
                content: { field: k, value: val }
              })
            }
            finalResult[k] = val
          })
          // once parsed successfully, remove consumed portion but keep recent context
          buffer = buffer.slice(last + 1)
          if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER)
        } catch (e) {
          console.warn("⚠️ Could not parse JSON candidate:", e)
        }
      }
    } catch (err) {
      console.warn("⚠️ Error handling chunk:", err)
    }
  }

  try {
    const first = buffer.indexOf("{")
    const last = buffer.lastIndexOf("}")
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = buffer.slice(first, last + 1)
      const parsed = JSON.parse(candidate)
      Object.keys(parsed).forEach((k) => {
        const val = parsed[k]
        const hasValue = val !== null && val !== "" && val !== undefined
        const prev = reportedFields.get(k)
        if (prev === undefined && hasValue) {
          reportedFields.set(k, hasValue)
          sendMessage<UpdateFieldStatusMessage>(port, {
            action: Action.UPDATE_FIELD_STATUS,
            content: { field: k, value: val }
          })
        } else if (!prev && hasValue) {
          reportedFields.set(k, true)
          sendMessage<UpdateFieldStatusMessage>(port, {
            action: Action.UPDATE_FIELD_STATUS,
            content: { field: k, value: val }
          })
        }
        finalResult[k] = val
      })
    }
  } catch (err) {
    console.warn("⚠️ Could not parse final buffer:", err)
  }

  return finalResult
}

async function processFiles(
  port: chrome.runtime.Port,
  form: Schema,
  userFiles: UserFile[]
) {
  if (!Object.keys(form).length || userFiles.length === 0)
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "No form schema or files provided for processing."
    })

  let onPortMsg: ((m: any) => void) | undefined = undefined

  try {
    console.time("FILES processing time")
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
    console.timeEnd("FILES processing time")

    // --- Call Chrome's built-in generative AI API ---
    console.time("AI startup time")
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "Starting AI model..."
    })
    const SYSTEM_PROMPT = `You are a strict and careful data extraction tool.
    - Your only task is to extract values from the IMAGE.
    - It is FORBIDDEN to make up values.
    - If a field's value IS NOT VISIBLE IN THE IMAGE, the corresponding value MUST BE an empty string ("") or null.
    - Be as literal as possible, but guarantee that the output matches the provided response constraint.
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
    console.timeEnd("AI startup time")
    
    // --- Process the response stream ---
    console.time("AI processing time")
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

    const stream = await session.promptStreaming(
      "Proceed with the extraction of information.",
      {
        signal: controller.signal,
        responseConstraint: form
      }
    )
    const result = await getFinalResult(stream, form, port)
    sendMessage<DoneMessage>(port, {
      action: Action.DONE,
      content: result
    })
    console.timeEnd("AI processing time")
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
