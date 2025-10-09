const CONTEXT_ITEM_PARENT_ID = "xport-context-item-parent"
const CONTEXT_ITEM_ID_FILE = "xport-context-item-file"
const CONTEXT_ITEM_ID_CAMERA = "xport-context-item-camera"
const CONTEXT_ITEM_ID_CLIPBOARD = "xport-context-item-clipboard"
enum Status {
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}
enum Action {
  PROCESS_FILES = "PROCESS_FILES",
  UPDATE_PROGRESS = "UPDATE_PROGRESS"
}
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

interface Request {
  action: Action
  files: UserFile[]
  form: Schema
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

// --- On message received from content script ---
chrome.runtime.onMessage.addListener(
  (request: Request, sender, sendResponse) => {
    console.log("✉️ Received message:", request)
    if (request.action === Action.PROCESS_FILES) {
      ;(async () => {
        const res = await fillFormFromFiles(
          sender.tab.id,
          request.form,
          request.files
        )
        sendResponse(res)
      })()
      // Return true to indicate we will call sendResponse asynchronously
      return true
    }
  }
)

async function fillFormFromFiles(
  tabId: number,
  form: Schema,
  userFiles: UserFile[]
) {
  if (!Object.keys(form).length || userFiles.length === 0)
    return {
      status: Status.ERROR,
      content: "No files provided for processing."
    }

  try {
    chrome.tabs.sendMessage(tabId, {
      action: Action.UPDATE_PROGRESS,
      message: "Processing files..."
    })
    const files = await Promise.all(
      userFiles.map((f) => {
        const uint8 = new Uint8Array(Object.values(f.data))
        return new File([uint8], f.name, { type: f.type })
      })
    )

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
    console.log(
      `🤖 AI session started. Sending ${files.length} files for processing...`
    )
    chrome.tabs.sendMessage(tabId, {
      action: Action.UPDATE_PROGRESS,
      message: "Sending files to AI model..."
    })
    const messages = files.map((file) => ({
      role: "user",
      content: [
        { type: "text", value: `This is the image with name: ${file.name}` },
        { type: "image", value: file }
      ]
    }))
    await session.append(messages)
    console.log(`🤖 Starting AI processing for ${messages.length} files...`)
    chrome.tabs.sendMessage(tabId, {
      action: Action.UPDATE_PROGRESS,
      message: "AI model is processing the files..."
    })
    const result = await session.prompt(
      "Proceed with the extraction of information.",
      {
        responseConstraint: form
      }
    )
    return {
      status: Status.COMPLETE,
      content: JSON.parse(result)
    }
  } catch (err) {
    console.log("❌ Error during AI processing:", err)
    return {
      status: Status.ERROR,
      content: err.message || "Unknown AI processing error"
    }
  }
}
