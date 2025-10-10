;(function () {
  function fillForm(form, content) {
    console.log(`🖊️ Filling form with content: ${JSON.stringify(content)}`)
    let filledCount = 0
    Object.keys(form.properties).forEach((item) => {
      const targetField =
        document.getElementById(item) ||
        document.querySelector(`[name="${item}"]`)
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

  function updateModal(
    isVisible,
    message = "MagicFill: Loading...",
    fields = null
  ) {
    const OVERLAY_ID = "magic-fill-loading-overlay"
    const STYLE_ID = "magic-fill-loading-styles"

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
  align-items: flex-start;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(180deg, #0b66ff 0%, #0047b3 100%);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.45);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-size: 14px;
  width: 360px;
}
.magic-fill-header {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}
.magic-fill-spinner {
  width: 28px;
  height: 28px;
  flex: 0 0 28px; /* fixed size: don't grow or shrink */
}
.magic-fill-spinner .mf-head {
  transform-origin: 50% 50%;
  animation: mf-spin 0.85s linear infinite;
  -webkit-animation: mf-spin 0.85s linear infinite;
}
@-webkit-keyframes mf-spin { to { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
@keyframes mf-spin { to { transform: rotate(360deg); } }
#magic-fill-loading-text { max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1 1 auto; min-width: 0; }
#magic-fill-count { display: block; margin-top: 8px; font-weight: 700; color: rgba(255,255,255,0.95); font-size: 13px; text-align: left; }

.magic-fill-field-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px 4px;
  color: rgba(255,255,255,0.95);
  font-size: 13px;
}
.magic-fill-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  line-height: 1;
  color: rgba(255,255,255,0.95);
  box-sizing: border-box;
}
.magic-fill-dot.found {
  background: #24b47e;
  border-color: rgba(255,255,255,0.9);
  color: #fff;
}
.magic-fill-dot.not-found {
  background: #ff6b6b;
  border-color: rgba(255,255,255,0.9);
  color: #fff;
}
.magic-fill-field-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#magic-fill-fields-list {
  margin-top: 8px;
  display: block;
  width: 100%;
  max-height: 240px;
  overflow: auto;
  padding: 6px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  box-sizing: border-box;
}

/* Scrollbar styling */
/* WebKit / Blink (Chrome, Edge, Safari) */
#magic-fill-fields-list::-webkit-scrollbar {
  width: 20px;
  height: 20px;
}
#magic-fill-fields-list::-webkit-scrollbar-track {
  background: transparent;
}
#magic-fill-fields-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 8px;
  border: 2px solid transparent; /* gives padding look */
  background-clip: padding-box;
}
#magic-fill-fields-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.14);
}

/* Firefox */
#magic-fill-fields-list {
  scrollbar-width: medium;
  scrollbar-color: rgba(255,255,255,0.5) transparent;
}
.magic-fill-field-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px 4px;
  color: rgba(255,255,255,0.95);
  font-size: 13px;
}
.magic-fill-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  line-height: 1;
  color: rgba(255,255,255,0.95);
  box-sizing: border-box;
}
.magic-fill-dot.found {
  background: #24b47e;
  border-color: rgba(255,255,255,0.9);
  color: #fff;
}
.magic-fill-dot.not-found {
  background: #ff6b6b;
  border-color: rgba(255,255,255,0.9);
  color: #fff;
}
.magic-fill-field-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
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
      <div class="magic-fill-header">
        <svg class="magic-fill-spinner" aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
          <circle class="mf-track" cx="12" cy="12" r="9.5" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"></circle>
          <circle class="mf-head" cx="12" cy="12" r="9.5" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="28 60"></circle>
        </svg>
  <div id="magic-fill-loading-text"></div>
  <button id="magic-fill-cancel" type="button" aria-label="Cancel" title="Cancel" style="margin-left:auto; cursor: pointer;">✕</button>
      </div>
      <div id="magic-fill-count" aria-hidden="true"></div>
      <div id="magic-fill-fields-list" aria-hidden="false" role="list" style="display:none;"></div>
    </div>`
        document.body.appendChild(overlay)
        const cancelBtn = overlay.querySelector("#magic-fill-cancel")
        if (cancelBtn) {
          cancelBtn.addEventListener("click", () => {
            console.log("❌ User clicked Cancel button.")
            const ov = document.getElementById(OVERLAY_ID)
            if (ov && ov.__mf_port) {
              try {
                if (typeof ov.__mf_port.postMessage === "function") {
                  ov.__mf_port.postMessage({ action: "CANCEL" })
                }
              } catch (e) {
                console.warn("⚠️ Failed to post CANCEL on port", e)
              }
            } else {
              console.log("⚠️ No port to send CANCEL message to.")
            }

            // Close the overlay/modal
            try {
              updateModal(false)
            } catch (e) {
              // as a fallback, directly hide the overlay
              const overlayEl = document.getElementById(OVERLAY_ID)
              if (overlayEl) overlayEl.style.display = "none"
              document.documentElement.style.pointerEvents = ""
            }
          })
        }
      }
      const textEl = document.getElementById("magic-fill-loading-text")
      if (textEl) textEl.textContent = message

      const fieldsListEl = document.getElementById("magic-fill-fields-list")
      if (
        fields &&
        Array.isArray(fields) &&
        fields.length > 0 &&
        fieldsListEl
      ) {
        fieldsListEl.style.display = "block"
        fieldsListEl.innerHTML = ""
        fields.forEach((f) => {
          const li = document.createElement("div")
          li.className = "magic-fill-field-item"
          li.setAttribute("data-field", f)
          li.setAttribute("role", "listitem")
          // start neutral (no reported state). the dot will be filled when a report arrives
          li.innerHTML = `<div class="magic-fill-dot" aria-hidden="true"></div><div class="magic-fill-field-name">${escapeHtml(f)}</div>`
          li.setAttribute("data-reported", "false")
          fieldsListEl.appendChild(li)
        })
        // initialize counters (reported / total)
        try {
          overlay.__mf_total = fields.length
          overlay.__mf_reportedCount = 0
          const countEl = document.getElementById("magic-fill-count")
          if (countEl) countEl.textContent = `0 / ${overlay.__mf_total}`
        } catch (e) {}
      }

      overlay.style.display = "flex"
      // prevent accidental clicks while loading
      document.documentElement.style.pointerEvents = "none"
      overlay.style.pointerEvents = "auto" // allow interaction with overlay (if needed)
    } else {
      if (overlay) {
        overlay.style.display = "none"
        if (
          overlay.__mf_port &&
          typeof overlay.__mf_port.disconnect === "function"
        ) {
          try {
            overlay.__mf_port.disconnect()
          } catch (e) {}
        }
        if (overlay.__mf_updateFieldStatus) delete overlay.__mf_updateFieldStatus
        if (overlay.__mf_port) delete overlay.__mf_port
        if (overlay.__mf_total) delete overlay.__mf_total
        if (overlay.__mf_reportedCount) delete overlay.__mf_reportedCount
      }
      document.documentElement.style.pointerEvents = ""
    }

    // helper to update a single field's DOM state
    function updateFieldStatus(fieldName, found) {
      const overlayEl = document.getElementById(OVERLAY_ID)
      if (!overlayEl) return
      const li = overlayEl.querySelector(
        `[data-field="${cssEscape(fieldName)}"]`
      )
      if (!li) return
      const dot = li.querySelector(".magic-fill-dot")
      if (!dot) return
      const prevReported = li.getAttribute("data-reported") === "true"
      // set visual state for found / not-found
      if (found) {
        dot.classList.remove("not-found")
        dot.classList.add("found")
        dot.textContent = "✓"
      } else {
        dot.classList.remove("found")
        dot.classList.add("not-found")
        dot.textContent = "✕"
      }
      // mark as reported if it's the first report for this field
      if (!prevReported) li.setAttribute("data-reported", "true")

      // update reported counters on overlay
      try {
        if (typeof overlayEl.__mf_reportedCount !== "number") overlayEl.__mf_reportedCount = 0
        if (typeof overlayEl.__mf_total !== "number") overlayEl.__mf_total = overlayEl.querySelectorAll(".magic-fill-field-item").length
        if (!prevReported) overlayEl.__mf_reportedCount++
        const countEl = overlayEl.querySelector("#magic-fill-count")
        if (countEl) countEl.textContent = `${overlayEl.__mf_reportedCount} / ${overlayEl.__mf_total}`
      } catch (e) {}
    }

    // expose update function on overlay element for external use
    if (isVisible) {
      overlay.__mf_updateFieldStatus = updateFieldStatus
    } else if (overlay && overlay.__mf_updateFieldStatus) {
      delete overlay.__mf_updateFieldStatus
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
        updateModal(true)
        try {
          const files = await Promise.all(
            userFiles.map(async (file) => {
              const buffer = await fileToArrayBuffer(file)
              return {
                name: file.name,
                type: file.type,
                size: file.size,
                data: Array.from(new Uint8Array(buffer))
              }
            })
          )
          const form = getFormSchema()
          updateModal(
            true,
            "Sending fields to background process...",
            Object.keys(form.properties)
          )

          const port = chrome.runtime.connect({ name: "MAGIC_FILL" })

          // attach the port to the overlay so the cancel button can access it
          const ovEl = document.getElementById("magic-fill-loading-overlay")
          if (ovEl) ovEl.__mf_port = port

          port.onMessage.addListener((msg) => {
            if (!msg || !msg.action) return
            switch (msg.action) {
              case "UPDATE_PROGRESS_MESSAGE":
                updateModal(true, msg.content)
                break
              case "UPDATE_FIELD_STATUS":
                const overlay = document.getElementById(
                  "magic-fill-loading-overlay"
                )
                if (overlay && overlay.__mf_updateFieldStatus) {
                  overlay.__mf_updateFieldStatus(
                    msg.content.field,
                    !!msg.content.found
                  )
                }
                break
              case "DONE":
                try {
                  const count = fillForm(form, msg.content || {})
                  console.log(`✅ Form filled. ${count} field(s) updated.`)
                } catch (e) {
                  console.warn("⚠️ Error filling form on DONE:", e)
                }
                updateModal(false)
                try {
                  port.disconnect()
                } catch (e) {}
                break
              default:
                // unknown action
                break
            }
          })

          port.postMessage({
            action: "START_PROCESSING",
            content: { form, files }
          })
        } catch (error) {
          console.log("❌ Error processing files:", error)
        }
      }
      document.body.removeChild(input)
    }

    input.appendChild(document.createElement("div"))
    document.body.appendChild(input)
    input.click()
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📩 Message received in content script:", msg)
    if (msg.action === "UPDATE_PROGRESS_MESSAGE") {
      const textEl = document.getElementById("magic-fill-loading-text")
      if (textEl) textEl.textContent = msg.content
      return
    }

    if (msg.action === "UPDATE_FIELD_STATUS") {
      console.log(
        `Field status update: ${msg.content.field} => ${msg.content.found}`
      )
      const overlay = document.getElementById("magic-fill-loading-overlay")
      if (overlay && overlay.__mf_updateFieldStatus) {
        overlay.__mf_updateFieldStatus(msg.content.field, !!msg.content.found)
      }
      return
    }
  })

  openFileExplorer()

  // small helpers used inside updateModal (declared here to allow use elsewhere if needed)
  function escapeHtml(str) {
    if (!str) return ""
    return String(str).replace(
      /[&<>\"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[m]
    )
  }
  // simple CSS escape for attribute selector queries
  function cssEscape(str) {
    return String(str).replace(/(["\\\]\[=])/g, "\\$1")
  }
})()
