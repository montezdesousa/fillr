;(function () {
  function fillForm(form, content) {
    console.log(`🖊️ Filling form with content: ${JSON.stringify(content)}`)
    let filledCount = 0

    const overlay = document.getElementById("magic-fill-loading-overlay")
    Object.keys(form.properties).forEach((item) => {
      const targetField =
        document.getElementById(item) ||
        document.querySelector(`[name="${item}"]`)

      if (!targetField) {
        overlay &&
          overlay.__mf_updateFieldFromDom &&
          overlay.__mf_updateFieldFromDom(item, false)
        console.log(`⚠️ Field not found in DOM: ${item}`)
        return
      }
      const value = content[item]
      if (value === undefined) {
        overlay &&
          overlay.__mf_updateFieldFromDom &&
          overlay.__mf_updateFieldFromDom(item, false)
        console.log(`⚠️ No content for field: ${item}`)
        return
      }
      targetField.value = value
      filledCount++
      overlay &&
        overlay.__mf_updateFieldFromDom &&
        overlay.__mf_updateFieldFromDom(item, true)
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
      const fieldKey = field.id || field.name
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
    fields = null,
    options = {}
  ) {
    const OVERLAY_ID = "magic-fill-loading-overlay"
    let overlay = document.getElementById(OVERLAY_ID)

    if (isVisible) {
      if (!overlay) {
        overlay = document.createElement("div")
        overlay.id = OVERLAY_ID
        overlay.setAttribute("role", "status")
        overlay.setAttribute("aria-live", "polite")

        overlay.className =
          "fixed inset-0 flex items-center justify-center z-[99999] bg-black/30 backdrop-blur-sm"

        overlay.innerHTML = `
    <div id="magic-fill-loading-box" aria-hidden="false" 
      class="
        inline-flex flex-col items-start gap-3 w-96 p-5 
        bg-white text-gray-800 shadow-2xl shadow-gray-700/50 
        font-sans
      "
    >
      <div class="flex items-center w-full gap-3">
        <div class="relative flex justify-center items-center h-7 w-7">
          <svg class="animate-spin magic-fill-spinner" aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke-gray-200" cx="12" cy="12" r="9.5" fill="none" stroke-width="2"></circle>
            <circle class="stroke-gray-800" cx="12" cy="12" r="9.5" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="28 60"></circle>
          </svg>
          <svg class="absolute hidden magic-fill-success" aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#22c55e" stroke-width="2"></circle>
            <path d="M7 13l3 3 7-7" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <div id="magic-fill-loading-text" class="truncate flex-grow min-w-0 font-medium"></div>        
      </div>
      
      <div id="magic-fill-count" aria-hidden="true" class="mt-2 font-semibold text-sm text-gray-600"></div>
      
      <div id="magic-fill-fields-list" aria-hidden="false"
        class="
          w-full max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100 
          flex flex-col gap-y-2
          magic-fill-list-container
        "
      ></div>
      <div id="magic-fill-actions" aria-hidden="true" class="mt-4 flex justify-end gap-3 w-full">
        <button
          id="magic-fill-btn-ok"
          type="button" 
          class="button primary-button"
        >
          OK
        </button>
        <button
          id="magic-fill-btn-cancel"
          type="button" 
          class="button secondary-button"
        >
          Cancel
        </button>
      </div>      
    </div>`

        document.body.appendChild(overlay)
        const okBtn = overlay.querySelector("#magic-fill-btn-ok")
        const cancelBtn = overlay.querySelector("#magic-fill-btn-cancel")

        if (okBtn) {
          okBtn.addEventListener("click", () => {
            console.log("✅ User clicked OK button (Fill accepted).")
            updateModal(false) // Closes the modal
          })
        }

        if (cancelBtn) {
          cancelBtn.addEventListener("click", () => {
            // ... (Keep your existing Cancel button logic here) ...
            // Your existing logic for posting CANCEL and calling updateModal(false)
            console.log("❌ User clicked Cancel button.")
            const ov = document.getElementById(OVERLAY_ID)
            // ... (rest of the existing CANCEL logic) ...
            if (ov && ov.__mf_port && ov.__mf_portAlive) {
              try {
                if (typeof ov.__mf_port.postMessage === "function") {
                  ov.__mf_port.postMessage({ action: "CANCEL" })
                }
              } catch (e) {
                console.warn("⚠️ Failed to post CANCEL on port", e)
              }
            }
            try {
              updateModal(false)
            } catch (e) {
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
        // fieldsListEl.style.display = "block"
        fieldsListEl.innerHTML = ""
        fields.forEach((f) => {
          const li = document.createElement("div")
          li.className = "magic-fill-field-item flex items-center py-1"
          li.setAttribute("data-field", f)
          li.setAttribute("role", "listitem")
          li.innerHTML = `
              <div 
                class="
                  w-3 h-3 rounded-full border-2 border-gray-400 
                  flex items-center justify-center 
                  font-bold text-xs leading-none text-white 
                  shrink-0 mr-2 magic-fill-dot
                " 
                aria-hidden="true"
              ></div>
              
              <div 
                  class="magic-fill-field-name truncate flex-grow min-w-0 -mt-px"
              >
                  ${escapeHtml(f)}
              </div>
            `
          li.setAttribute("data-reported", "false")
          fieldsListEl.appendChild(li)
        })
        updateButtonState("LOADING")
        // initialize counters (reported / total)
        try {
          overlay.__mf_total = fields.length
          overlay.__mf_AiReportedCount = 0
          overlay.__mf_DomReportedCount = 0
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
        if (overlay.__mf_updateFieldFromAi)
          delete overlay.__mf_updateFieldFromAi
        if (overlay.__mf_updateFieldFromDom)
          delete overlay.__mf_updateFieldFromDom
        if (overlay.__mf_port) delete overlay.__mf_port
        if (overlay.__mf_total) delete overlay.__mf_total
        if (overlay.__mf_AiReportedCount) delete overlay.__mf_AiReportedCount
        if (overlay.__mf_DomReportedCount) delete overlay.__mf_DomReportedCount
      }
      document.documentElement.style.pointerEvents = ""
    }

    function updateFieldFromDom(fieldName, filled) {
      const overlayEl = document.getElementById(OVERLAY_ID)
      if (!overlayEl) return
      const li = overlayEl.querySelector(
        `[data-field="${cssEscape(fieldName)}"]`
      )
      if (!li) return
      const dot = li.querySelector(".magic-fill-dot")
      if (!dot) return
      dot.scrollIntoView({ block: "center", behavior: "smooth" })
      if (filled) {
        // SUCCESS: Apply Green background and border utilities
        dot.classList.remove(
          "bg-red-500",
          "border-red-600",
          "bg-yellow-500",
          "border-yellow-600"
        )
        dot.classList.add("bg-green-500", "border-green-600")
        dot.textContent = "✓"
      } else {
        // SKIPPED: Apply Yellow background and border utilities
        dot.classList.remove(
          "bg-green-500",
          "border-green-600",
          "bg-red-500",
          "border-red-600"
        )
        dot.classList.add("bg-yellow-500", "border-yellow-600")
        dot.textContent = "✕"
      }

      // update reported counters on overlay
      try {
        if (typeof overlayEl.__mf_DomReportedCount !== "number")
          overlayEl.__mf_DomReportedCount = 0
        if (typeof overlayEl.__mf_total !== "number")
          overlayEl.__mf_total = overlayEl.querySelectorAll(
            ".magic-fill-field-item"
          ).length
        if (filled) overlayEl.__mf_DomReportedCount++
        const countEl = overlayEl.querySelector("#magic-fill-count")
        if (countEl)
          countEl.textContent = `${overlayEl.__mf_DomReportedCount} / ${overlayEl.__mf_total} filled`
      } catch (e) {}
    }

    // helper to update a single field's DOM state
    function updateFieldFromAi(fieldName, found) {
      const overlayEl = document.getElementById(OVERLAY_ID)
      if (!overlayEl) return
      const li = overlayEl.querySelector(
        `[data-field="${cssEscape(fieldName)}"]`
      )
      if (!li) return
      const dot = li.querySelector(".magic-fill-dot")
      if (!dot) return
      dot.scrollIntoView({ block: "nearest", behavior: "smooth" })
      const prevReported = li.getAttribute("data-reported") === "true"
      // set visual state for found / not-found
      if (found) {
        // FOUND: Apply Blue background and border utilities
        dot.classList.remove(
          "bg-red-500",
          "border-red-600",
          "bg-yellow-500",
          "border-yellow-600"
        )
        dot.classList.add("bg-blue-500", "border-blue-600")
      } else {
        // NOT FOUND: Apply Red background and border utilities
        dot.classList.remove(
          "bg-blue-500",
          "border-blue-600",
          "bg-yellow-500",
          "border-yellow-600"
        )
        dot.classList.add("bg-red-500", "border-red-600")
      }
      // mark as reported if it's the first report for this field
      if (!prevReported) li.setAttribute("data-reported", "true")

      // update reported counters on overlay
      try {
        if (typeof overlayEl.__mf_AiReportedCount !== "number")
          overlayEl.__mf_AiReportedCount = 0
        if (typeof overlayEl.__mf_total !== "number")
          overlayEl.__mf_total = overlayEl.querySelectorAll(
            ".magic-fill-field-item"
          ).length
        if (!prevReported) overlayEl.__mf_AiReportedCount++
        const countEl = overlayEl.querySelector("#magic-fill-count")
        if (countEl)
          countEl.textContent = `${overlayEl.__mf_AiReportedCount} / ${overlayEl.__mf_total} found`
      } catch (e) {}
    }

    // helper to manage OK/Cancel button states
    function updateButtonState(state) {
      const overlayEl = document.getElementById(OVERLAY_ID)
      if (!overlayEl) return

      // Note: actionsEl is not strictly needed here but can be if you want to show/hide the container.
      // const actionsEl = overlayEl.querySelector('#magic-fill-actions')

      const okBtn = overlayEl.querySelector("#magic-fill-btn-ok")
      const cancelBtn = overlayEl.querySelector("#magic-fill-btn-cancel")

      if (!okBtn || !cancelBtn) return

      if (state === "DONE") {
        okBtn.disabled = false
        cancelBtn.disabled = true
      } else {
        okBtn.disabled = true
        cancelBtn.disabled = false
      }
    }
    // expose a small API to toggle success state
    function setSuccessState(enabled) {
      const overlayEl = document.getElementById(OVERLAY_ID)
      if (!overlayEl) return

      // NOW FINDS THE ELEMENTS:
      const spinner = overlayEl.querySelector(".magic-fill-spinner")
      const success = overlayEl.querySelector(".magic-fill-success")

      if (enabled) {
        if (spinner) spinner.style.display = "none" // Stops the spinner
        if (success) success.style.display = "block" // Shows the checkmark
        // The mf-stopped class is no longer necessary, as display: none handles it.
      } else {
        if (spinner) spinner.style.display = "" // Resets to default (block/inline)
        if (success) success.style.display = "none" // Hides the checkmark
        // The mf-stopped class is no longer necessary.
      }
    }

    // expose update function on overlay element for external use
    if (isVisible) {
      overlay.__mf_updateFieldFromAi = updateFieldFromAi
      overlay.__mf_updateFieldFromDom = updateFieldFromDom
      overlay.__mf_setSuccessState = setSuccessState
      overlay.__mf_updateButtonState = updateButtonState
    } else if (overlay && overlay.__mf_updateFieldFromAi) {
      delete overlay.__mf_updateFieldFromAi
      if (overlay.__mf_updateFieldFromDom)
        delete overlay.__mf_updateFieldFromDom
      if (overlay.__mf_setSuccessState) delete overlay.__mf_setSuccessState
      if (overlay.__mf_updateButtonState) delete overlay.__mf_updateButtonState
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

  function convertToJpeg(file, quality = 0.8) {
    const outputMimeType = "image/jpeg"
    const MAX_WIDTH = 1920
    const MAX_HEIGHT = 1920
    return new Promise((resolve, reject) => {
      const img = new Image()
      const blobUrl = URL.createObjectURL(file)
      img.src = blobUrl

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        reject(new Error("Image load error"))
      }

      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width))
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height))
            height = MAX_HEIGHT
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                {
                  type: outputMimeType,
                  lastModified: Date.now()
                }
              )
              resolve(compressedFile)
            } else {
              reject(new Error("Image compression failed"))
            }
          },
          outputMimeType,
          quality
        )
      }
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
              const jpeg = await convertToJpeg(file, 0.6)
              const buffer = await fileToArrayBuffer(jpeg)
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
          if (ovEl) {
            ovEl.__mf_port = port
            // mark port as alive so the cancel handler can check before posting
            ovEl.__mf_portAlive = true
          }

          // clear the alive flag when the port disconnects
          try {
            if (
              port &&
              port.onDisconnect &&
              typeof port.onDisconnect.addListener === "function"
            ) {
              port.onDisconnect.addListener(() => {
                try {
                  const ovd = document.getElementById(
                    "magic-fill-loading-overlay"
                  )
                  if (ovd) ovd.__mf_portAlive = false
                } catch (e) {}
              })
            }
          } catch (e) {}

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
                if (overlay && overlay.__mf_updateFieldFromAi) {
                  overlay.__mf_updateFieldFromAi(
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
                try {
                  const ov = document.getElementById(
                    "magic-fill-loading-overlay"
                  )
                  if (ov && typeof ov.__mf_setSuccessState === "function") {
                    ov.__mf_setSuccessState(true)
                    // Call the new button state function here
                    if (ov.__mf_updateButtonState)
                      ov.__mf_updateButtonState("DONE") // <-- ADD THIS
                  } else {
                    updateModal(true, "Done", null, { success: true })
                  }
                  const textEl = document.getElementById(
                    "magic-fill-loading-text"
                  )
                  if (textEl) textEl.textContent = "Done — form filled."
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
      if (overlay && overlay.__mf_updateFieldFromAi) {
        overlay.__mf_updateFieldFromAi(msg.content.field, !!msg.content.found)
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
