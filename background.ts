const CONTEXT_ITEM_ID = "xport-context-item"
enum Status {
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}
enum Action {
  PROCESS_FILES = "PROCESS_FILES"
}
interface UserFile {
  name: string
  type: "image/jpeg" | "image/png"
  data: string // Base64 encoded string (Data URL)
}
interface ResponseConstraint {
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
interface Form {
  [key: string]: any // Define the structure of your form data here
}
interface Request {
  action: Action
  files: UserFile[]
  form: Form
}

// --- Create context menu ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll()
  chrome.contextMenus.create({
    id: CONTEXT_ITEM_ID,
    title: "MagicFill: Fill with AI",
    contexts: ["all"]
  })
  console.log("⚙️ Context menu item created.")
})

// --- On context menu item clicked ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || info.menuItemId !== CONTEXT_ITEM_ID) return
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
        const res = await fillFormFromFiles(request.form, request.files)
        sendResponse(res)
      })()
      // Return true to indicate we will call sendResponse asynchronously
      return true
    }
  }
)

function b64ToBlob(file: UserFile): File {
  console.log(
    `🔄 Converting file: ${file.name}, type: ${file.type}, size: ${file.data.length}`
  )
  let b64Data = ""
  // Handle header if exists "data:mime/type;base64,BASE64_DATA"
  if (file.data.includes(",")) b64Data = file.data.split(",")[1]
  else b64Data = file.data
  if (!b64Data) throw new Error("Invalid Base64 data")
  const chars = atob(b64Data)
  const numbers = new Array<number>(chars.length)
  for (let i = 0; i < chars.length; i++) numbers[i] = chars.charCodeAt(i)
  const bytes = new Uint8Array(numbers)
  const blob = new Blob([bytes], { type: file.type })
  return new File([blob], file.name, { type: file.type })
}

function formToResponseConstraint(form: Form): ResponseConstraint {
  // TODO: Implement a dynamic conversion from Form to ResponseConstraint
  const schema = {
    type: "object" as const,
    properties: {
      nifEmitente: {
        type: "string" as const,
        description: "O Identificador Fiscal do contribuinte"
      }
    },
    required: ["nifEmitente"],
    additionalProperties: false
  }
  return schema
}

async function fillFormFromFiles(form: Form, userFiles: UserFile[]) {
  if (!Object.keys(form).length || userFiles.length === 0)
    return {
      status: Status.ERROR,
      content: "No files provided for processing."
    }

  try {
    const files = await Promise.all(userFiles.map((file) => b64ToBlob(file)))
    const constraint = formToResponseConstraint(form)

    // @ts-ignore - Chrome's built-in AI API
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }]
    })
    const messages = files.map((file) => ({
      role: "user",
      content: [{ type: "image", value: file }]
    }))
    await session.append(messages)
    console.log(`🤖 Starting AI processing for ${messages.length} files...`)
    // TODO: Send message to content script to show a loading indicator
    const result = await session.prompt(
      "Proceed with the extraction of information.",
      {
        responseConstraint: constraint
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
