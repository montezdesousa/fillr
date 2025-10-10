const PORT_NAME = "MAGIC_FILL"
const CONTEXT_ITEM_PARENT_ID = "xport-context-item-parent"
const CONTEXT_ITEM_ID_FILE = "xport-context-item-file"
const CONTEXT_ITEM_ID_CAMERA = "xport-context-item-camera"
const CONTEXT_ITEM_ID_CLIPBOARD = "xport-context-item-clipboard"
enum Action {
  START_PROCESSING = "START_PROCESSING",
  UPDATE_PROGRESS_MESSAGE = "UPDATE_PROGRESS_MESSAGE",
  UPDATE_FIELD_STATUS = "UPDATE_FIELD_STATUS",
  DONE = "DONE",
  CANCEL = "CANCEL"
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
  content: { field: string; found: boolean }
}
interface DoneMessage {
  action: Action.DONE
  content: { [key: string]: any }
}
type Message =
  | StartProcessingMessage
  | UpdateProgressMessage
  | UpdateFieldStatusMessage
  | DoneMessage
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
  chrome.contextMenus.create({
    id: CONTEXT_ITEM_ID_FILE,
    title: "File",
    parentId: CONTEXT_ITEM_PARENT_ID,
    contexts: ["all"]
  })
  chrome.contextMenus.create({
    id: CONTEXT_ITEM_ID_CAMERA,
    title: "Camera",
    parentId: CONTEXT_ITEM_PARENT_ID,
    contexts: ["all"],
    enabled: false // TODO: To be implemented
  })
  chrome.contextMenus.create({
    id: CONTEXT_ITEM_ID_CLIPBOARD,
    title: "Clipboard",
    parentId: CONTEXT_ITEM_PARENT_ID,
    contexts: ["all"],
    enabled: false // TODO: To be implemented
  })
  console.log("⚙️ Context menu item created.")
})

// --- On context menu item clicked ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || info.menuItemId !== CONTEXT_ITEM_ID_FILE) return
  console.log("👆 Context menu item clicked. Injecting content script...")
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["script.js"]
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

async function processFiles(
  port: chrome.runtime.Port,
  form: Schema,
  userFiles: UserFile[]
) {
  const sendMessage = <Message>(
    port: chrome.runtime.Port,
    message: Message
  ) => {
    port.postMessage(message)
  }

  if (!Object.keys(form).length || userFiles.length === 0)
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
      content: `AI model started. Sending ${files.length} file(s) for processing...`
    })
    const messages = files.map((file) => ({
      role: "user",
      content: [
        { type: "text", value: `This is the image with name: ${file.name}` },
        { type: "image", value: file }
      ]
    }))
    await session.append(messages)
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "AI model is processing the files..."
    })
    const controller = new AbortController()
    onPortMsg = (m: any) => {
      try {
        if (m?.action === "CANCEL") {
          console.log("🛑 Cancel requested via port")
          try {
            controller.abort()
            sendMessage<UpdateProgressMessage>(port, {
              action: Action.UPDATE_PROGRESS_MESSAGE,
              content: "Processing canceled by user."
            })
          } catch (e) {
            console.warn("⚠️ Error aborting controller:", e)
          }
        }
      } catch (e) {
        console.warn("⚠️ Error in onPortMsg handler:", e)
      }
    }
    if (port && port.onMessage && onPortMsg) {
      port.onMessage.addListener(onPortMsg)
    }
    const stream = await session.promptStreaming(
      "Proceed with the extraction of information.",
      {
        signal: controller.signal,
        responseConstraint: form
      }
    )
    // We'll accumulate the streaming chunks and attempt to parse the partial
    // JSON that the model returns according to `form`. We'll also scan each
    // incoming chunk for key:value patterns so we can report fields
    // immediately when they appear in the stream.
    let buffer = ""
    const MAX_BUFFER = 8 * 1024 // keep last 8KB of stream to allow reassembly across chunks
    const expectedFields = Object.keys(form.properties || {})
    const reportedFields = new Map<string, boolean>()
    let finalResult: { [k: string]: any } = {}

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    for await (const chunk of stream) {
      try {
        const text = typeof chunk === "string" ? chunk : JSON.stringify(chunk)
        console.log("🤖 Received chunk:", text)
        buffer += text
        // cap rolling buffer so it doesn't grow without bound but keeps recent context
        if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER)

        // quick scan: look for key:value pairs for expected fields in the
        // current buffer and report them immediately.
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
            if (prev === undefined || prev !== hasValue) {
              reportedFields.set(k, hasValue)
              const matchIndex = buffer.indexOf(m[0])
              const before = buffer.slice(
                Math.max(0, matchIndex - 40),
                matchIndex
              )
              const after = buffer.slice(
                matchIndex + (m[0] || "").length,
                matchIndex + (m[0] || "").length + 40
              )
              console.log(
                `📣 Immediate field report: ${k} => ${hasValue ? "FOUND" : "EMPTY/NULL"} (match: ${m[0]})\n  ...${before}[MATCH]${after}...`
              )
              sendMessage<UpdateFieldStatusMessage>(port, {
                action: Action.UPDATE_FIELD_STATUS,
                content: { field: k, found: !!hasValue }
              })
            }
            finalResult[k] = val
          }
        }

        // TODO: Do we need both immediate key:value detection above AND full JSON parsing below?
        // try to extract a JSON substring from buffer
        // naive approach: find first `{` and last `}` and try to parse
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
              if (prev === undefined) {
                reportedFields.set(k, hasValue)
                console.log(`🆕 Field found: ${k}`)
                sendMessage<UpdateFieldStatusMessage>(port, {
                  action: Action.UPDATE_FIELD_STATUS,
                  content: { field: k, found: !!hasValue }
                })
              } else if (!prev && hasValue) {
                // previously reported as not found, now found -> update
                reportedFields.set(k, true)
                console.log(`✅ Field now found: ${k}`)
                sendMessage<UpdateFieldStatusMessage>(port, {
                  action: Action.UPDATE_FIELD_STATUS,
                  content: { field: k, found: true }
                })
              }
              finalResult[k] = val
            })
            // once parsed successfully, remove consumed portion but keep recent context
            buffer = buffer.slice(last + 1)
            if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER)
          } catch (e) {
            // JSON still incomplete or invalid; keep buffering
            // console.log('partial JSON, waiting for more data')
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
          if (prev === undefined) {
            reportedFields.set(k, hasValue)
            sendMessage<UpdateFieldStatusMessage>(port, {
              action: Action.UPDATE_FIELD_STATUS,
              content: { field: k, found: !!hasValue }
            })
          } else if (!prev && hasValue) {
            reportedFields.set(k, true)
            sendMessage<UpdateFieldStatusMessage>(port, {
              action: Action.UPDATE_FIELD_STATUS,
              content: { field: k, found: true }
            })
          }
          finalResult[k] = val
        })
      }
    } catch (err) {
      console.warn("⚠️ Could not parse final buffer:", err)
    }

    console.log("✅ AI processing complete. Final result:", finalResult)
    // TODO: action and status seem duplicated here
    sendMessage<DoneMessage>(port, {
      action: Action.DONE,
      content: finalResult
    })
  } catch (err) {
    console.log("❌ Error during AI processing:", err)
    sendMessage<UpdateProgressMessage>(port, {
      action: Action.UPDATE_PROGRESS_MESSAGE,
      content: "Error during processing."
    })
  } finally {
    try {
      if (port && port.onMessage && onPortMsg)
        port.onMessage.removeListener(onPortMsg)
    } catch (e) {}
  }
}
