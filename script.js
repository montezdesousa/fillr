;(function () {
  function fillForm(form, content) {
    console.log(`🖊️ Filling form with content: ${JSON.stringify(content)}`)
    let filledCount = 0
    Object.keys(form.properties).forEach((item) => {
      const targetField = document.getElementById(item) || document.querySelector(`[name="${item}"]`)
      if (!targetField) {
        console.log(`⚠️ Field not found in DOM: ${item}`)
        return
      }
      const value = content[item]
      if (value === undefined) {
        console.log(`⚠️ No content for field: ${item}`)
        return
      }
      targetField.value = value
      filledCount++
      targetField.dispatchEvent(new Event("input", { bubbles: true }))
      targetField.dispatchEvent(new Event("change", { bubbles: true }))
    })
    return filledCount
  }

  function getFormSchema() {
    const schema = {
      type: "object",
      properties: {},
      additionalProperties: false
    }
    const fields = document.querySelectorAll(
      'input:not([type="submit"]):not([type="hidden"]), textarea, select'
    )
    fields.forEach((field, index) => {
      const fieldKey = field.id || field.name || `field_${index}`
      if (fieldKey) {
        let labelText = ""
        const label = document.querySelector(`label[for="${field.id}"]`)
        if (label) labelText = label.textContent.trim()
        let fieldType = "string"
        const inputType = field.type ? field.type.toLowerCase() : ""
        switch (inputType) {
          case "number":
          case "range":
            fieldType = "number"
            break
          case "checkbox":
          case "radio":
            fieldType = "boolean"
            break
          default:
            fieldType = "string"
        }
        schema.properties[fieldKey] = {
          type: fieldType,
          description: `name: ${field.name}, description: ${field.ariaDescription}, label: ${labelText}, placeholder: ${field.ariaPlaceholder}`
        }
      }
    })
    return schema
  }

  function toggleLoading(isVisible, message = "MagicFill: Loading...") {
    const OVERLAY_ID = "magic-fill-loading-overlay"
    const STYLE_ID = "magic-fill-loading-styles"

    // injetar estilos uma vez
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = `
#${OVERLAY_ID} {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
#magic-fill-loading-box {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  background: linear-gradient(180deg, #0b66ff 0%, #0047b3 100%);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.45);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-size: 14px;
}
.magic-fill-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.22);
  border-top-color: #ffffff;
  animation: mf-spin 0.9s linear infinite;
  box-sizing: border-box;
}
@keyframes mf-spin { to { transform: rotate(360deg); } }
#magic-fill-loading-text { max-width: 360px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`
      document.head.appendChild(style)
    }

    let overlay = document.getElementById(OVERLAY_ID)

    if (isVisible) {
      if (!overlay) {
        overlay = document.createElement("div")
        overlay.id = OVERLAY_ID
        overlay.setAttribute("role", "status")
        overlay.setAttribute("aria-live", "polite")
        overlay.innerHTML = `
  <div id="magic-fill-loading-box" aria-hidden="false">
    <div class="magic-fill-spinner" aria-hidden="true"></div>
    <div id="magic-fill-loading-text"></div>
  </div>`
        document.body.appendChild(overlay)
      }
      const textEl = document.getElementById("magic-fill-loading-text")
      if (textEl) textEl.textContent = message
      overlay.style.display = "flex"
      // impedir cliques acidentais enquanto carregando
      document.documentElement.style.pointerEvents = "none"
      overlay.style.pointerEvents = "auto" // permitir interação com o overlay (se necessário)
    } else {
      if (overlay) overlay.style.display = "none"
      document.documentElement.style.pointerEvents = ""
    }
  }

  function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  function openFileExplorer() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = "image/*"
    input.style.display = "none"

    input.onchange = async function (event) {
      const userFiles = Array.from(event.target.files)
      if (userFiles.length > 0) {
        console.log(`🖼️ ${userFiles.length} file(s) selected.`)
        toggleLoading(true)
        try {
          const files = await Promise.all(
            userFiles.map(async (file) => {
              const buffer = await fileToArrayBuffer(file);
              return {
                name: file.name,
                type: file.type,
                size: file.size,
                data: Array.from(new Uint8Array(buffer))
              };
            })
          );
          const form = getFormSchema()
          const response = await chrome.runtime.sendMessage({
            action: "PROCESS_FILES",
            form: form,
            files: files
          })

          switch (response?.status) {
            case "COMPLETE":
              const count = fillForm(form, response.content)
              console.log(`✅ Form filled. ${count} field(s) updated.`)
              break
            case "ERROR":
              console.log("❌ AI processing error:", response.content)
              break
            default:
              console.log("❌ Unexpected response:", response)
          }
        } catch (error) {
          console.log("❌ Error processing files:", error)
        } finally {
          toggleLoading(false)
        }
      }
      document.body.removeChild(input)
    }

    input.appendChild(document.createElement("div"))
    document.body.appendChild(input)
    input.click()
  }

  openFileExplorer()
})()
