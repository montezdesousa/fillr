;(function () {
  const SPINNER_SVG = `
<svg class="animate-[spin_0.5s_linear_infinite] absolute w-full h-full" viewBox="0 0 32 32">
  <circle class="stroke-gray-200" cx="16" cy="16" r="14" fill="none" stroke-width="2"></circle>
  <circle 
      cx="16" 
      cy="16" 
      r="14" 
      fill="none"
      stroke="#4893FC"
      stroke-linecap="round" 
      stroke-dasharray="28 60">
  </circle>
</svg>
`

  const GEMINI_SVG = `
<svg
  class="magic-fill-inner-ai z-10 absolute inset-0 m-auto" width="16" height="16"
  fill="none" xmlns="http://www.w3.org/2000/svg"
  //viewBox="0 0 65 65"
  style="display: block;"
><mask id="maskme" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65"><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000"/><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)"/></mask><g mask="url(#maskme)"><g filter="url(#prefix__filter0_f_2001_67)"><path d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z" fill="#FFE432"/></g><g filter="url(#prefix__filter1_f_2001_67)"><path d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z" fill="#FC413D"/></g><g filter="url(#prefix__filter2_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter3_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter4_f_2001_67)"><path d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z" fill="#00B95C"/></g><g filter="url(#prefix__filter5_f_2001_67)"><path d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z" fill="#3186FF"/></g><g filter="url(#prefix__filter6_f_2001_67)"><path d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z" fill="#FBBC04"/></g><g filter="url(#prefix__filter7_f_2001_67)"><path d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z" fill="#3186FF"/></g><g filter="url(#prefix__filter8_f_2001_67)"><path d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z" fill="#749BFF"/></g><g filter="url(#prefix__filter9_f_2001_67)"><path d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z" fill="#FC413D"/></g><g filter="url(#prefix__filter10_f_2001_67)"><path d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z" fill="#FFEE48"/></g></g><defs><filter id="prefix__filter0_f_2001_67" x="-19.824" y="13.152" width="39.274" height="43.217" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter1_f_2001_67" x="-15.001" y="-40.257" width="84.868" height="85.688" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter2_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter3_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter4_f_2001_67" x="-19.845" y="15.459" width="79.731" height="81.505" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter5_f_2001_67" x="29.832" y="-11.552" width="75.117" height="73.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter6_f_2001_67" x="-38.583" y="-16.253" width="78.135" height="78.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter7_f_2001_67" x="8.107" y="-5.966" width="78.877" height="77.539" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter8_f_2001_67" x="13.587" y="-18.488" width="56.272" height="51.81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter9_f_2001_67" x="-15.526" y="-31.297" width="70.856" height="69.306" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter10_f_2001_67" x="-14.168" y="20.964" width="55.501" height="51.571" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67"/></filter><linearGradient id="prefix__paint0_linear_2001_67" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse"><stop stop-color="#4893FC"/><stop offset=".27" stop-color="#4893FC"/><stop offset=".777" stop-color="#969DFF"/><stop offset="1" stop-color="#BD99FE"/></linearGradient></defs></svg>  
`

  const MAIN_ICON_SVG = `
<svg class="magic-fill-ai absolute w-8 h-8 z-20" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)"/><defs><radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"><stop offset=".067" stop-color="#9168C0"/><stop offset=".343" stop-color="#5684D1"/><stop offset=".672" stop-color="#1BA1E3"/></radialGradient></defs></svg>  
`

  const PROCESSING_MODAL_HTML = `
<div id="magic-fill-loading-box" aria-hidden="false" 
  class="
    inline-flex flex-col items-start gap-3 w-96 p-5 
    bg-white text-gray-800 shadow-2xl shadow-gray-700/50 
    font-sans
  "
>
  <div class="flex items-center w-full gap-3">
    <div class="modal-primary-icon-placeholder relative w-8 h-8 flex items-center justify-center"></div>
    <div id="modal-primary-message" class="text-s truncate flex-grow min-w-0 font-medium text-gray-700"></div>        
  </div>
  <div id="modal-secondary-message" class="mt-2 ml-2 font-semibold text-xs text-gray-600"></div>  
  <div id="magic-fill-fields-list" aria-hidden="false"
    class="
      w-full max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100 
      flex flex-col gap-y-2
      magic-fill-list-container
    "
  ></div>
  <div id="magic-fill-actions" class="mt-4 flex justify-end gap-3 w-full">
    <button
      id="magic-fill-btn-accept"
      type="button" 
      class="mf-button mf-primary-button"
    >
      Accept
    </button>
    <button
      id="magic-fill-btn-cancel"
      type="button" 
      class="mf-button mf-secondary-button"
    >
      Cancel
    </button>
  </div>      
</div>`

  const CAMERA_MODAL_HTML = `
    <div class="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 w-[22rem]">
      <h2 class="text-lg font-bold">Take a photo</h2>
      <video id="camera-stream" autoplay playsinline class="rounded-lg w-full h-64 object-cover bg-black"></video>
      <div class="flex gap-2 w-full">
        <button id="camera-capture" class="mf-button mf-primary-button flex-1">Capture</button>
        <button id="camera-cancel" class="mf-button flex-1">Cancel</button>
      </div>
    </div>
  `

  const CHOICE_MODAL_HTML = `
  <div class="bg-white p-6 rounded-lg shadow-xl flex flex-col w-80">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-6 h-6 rounded flex items-center justify-center">
        ${MAIN_ICON_SVG}  
      </div>
      <h2 class="text-s font-medium text-gray-700">Choose input method</h2>
    </div>

    <div class="flex flex-col gap-2">
      <button id="choice-file" class="mf-button mf-secondary-button w-full">File</button>
      <button id="choice-camera" class="mf-button mf-secondary-button w-full">Camera</button>
    </div>
  </div>
`

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

  const ProcessingModal = (() => {
    const OVERLAY_ID = "magic-fill-overlay"
    let overlay = null

    // --- CREATE OVERLAY ---
    function createOverlay() {
      if (overlay) return // reuse existing
      overlay = document.createElement("div")
      overlay.id = OVERLAY_ID
      overlay.setAttribute("role", "status")
      overlay.setAttribute("aria-live", "polite")
      overlay.className =
        "fixed inset-0 flex items-center justify-center z-[99999] bg-black/30 backdrop-blur-sm"
      overlay.innerHTML = PROCESSING_MODAL_HTML // your modal HTML here
      document.body.appendChild(overlay)

      // Buttons setup
      const acceptBtn = overlay.querySelector("#magic-fill-btn-accept")
      const cancelBtn = overlay.querySelector("#magic-fill-btn-cancel")

      if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
          try {
            const count = fillForm(
              overlay.__mf_formSchema,
              overlay.__mf_formContent
            )
            console.log(`✅ Form filled. ${count} field(s) updated.`)
          } catch (e) {
            console.warn("⚠️ Error filling form on DONE:", e)
          }
          close()
        })
      }

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          console.log("❌ User clicked Cancel button.")
          resetModalState()
        })
      }

      overlay.style.display = "none"
      return overlay
    }

    // --- RESET MODAL ---
    function resetModalState() {
      if (!overlay) return

      // Cancel running port
      if (overlay.__mf_port) {
        try {
          overlay.__mf_port.postMessage({
            action: "CANCEL",
            message: "User clicked Cancel"
          })
        } catch {}
        try {
          overlay.__mf_port.disconnect()
        } catch {}
      }
      delete overlay.__mf_port

      // Reset form & fields
      overlay.__mf_lastFields = null
      overlay.__mf_formSchema = null
      overlay.__mf_formContent = null
      overlay.__mf_total = 0
      overlay.__mf_AiReportedCount = 0

      // Clear field list
      const fieldsListEl = overlay.querySelector("#magic-fill-fields-list")
      if (fieldsListEl) fieldsListEl.innerHTML = ""

      // Reset spinner & icon
      const placeholder = overlay.querySelector(
        ".modal-primary-icon-placeholder"
      )
      if (placeholder) placeholder.innerHTML = ""

      // Reset buttons
      const acceptBtn = overlay.querySelector("#magic-fill-btn-accept")
      if (acceptBtn) acceptBtn.disabled = true

      // Hide modal
      overlay.style.display = "none"
      document.documentElement.style.pointerEvents = ""
    }

    // --- OPEN MODAL ---
    function open(message = "MagicFill: Loading...", fields = null) {
      createOverlay() // ensures overlay exists

      delete overlay.__mf_port

      _showSpinner()

      const textEl = overlay.querySelector("#modal-primary-message")
      if (textEl) textEl.textContent = message

      if (Array.isArray(fields)) {
        populateFields(fields)
        overlay.__mf_lastFields = fields
      } else if (overlay.__mf_lastFields) {
        populateFields(overlay.__mf_lastFields)
      }

      const acceptBtn = overlay.querySelector("#magic-fill-btn-accept")
      if (acceptBtn) acceptBtn.disabled = true

      document.documentElement.style.pointerEvents = "none"
      overlay.style.display = "flex"
      overlay.style.pointerEvents = "auto"
    }

    // --- UPDATE MODAL ---
    function update(message = "MagicFill: Loading...", fields = null) {
      createOverlay()

      const textEl = overlay.querySelector("#modal-primary-message")
      if (textEl) textEl.textContent = message

      if (fields && Array.isArray(fields)) populateFields(fields)

      overlay.style.display = "flex"
      document.documentElement.style.pointerEvents = "none"
      overlay.style.pointerEvents = "auto"
    }

    // --- CLOSE MODAL ---
    function close() {
      if (!overlay) return
      document.documentElement.style.pointerEvents = ""
      overlay.style.display = "none"
    }

    // --- SPINNER / MAIN ICON ---
    function _showSpinner(modalEl = overlay) {
      if (!modalEl) return
      const placeholder = modalEl.querySelector(
        ".modal-primary-icon-placeholder"
      )
      if (!placeholder) return

      placeholder.innerHTML = `
        <div class="flex w-full h-full relative">
          ${SPINNER_SVG}
          ${GEMINI_SVG}
        </div>
      `
    }

    function showErrorIcon(modalEl = overlay) {
      if (!modalEl) return
      const placeholder = modalEl.querySelector(
        ".modal-primary-icon-placeholder"
      )
      if (!placeholder) return

      placeholder.innerHTML = MAIN_ICON_SVG
    }

    function showMainIcon(modalEl = overlay) {
      if (!modalEl) return
      const placeholder = modalEl.querySelector(
        ".modal-primary-icon-placeholder"
      )
      if (!placeholder) return

      placeholder.innerHTML = MAIN_ICON_SVG
    }

    // --- POPULATE FIELDS ---
    function populateFields(fields) {
      createOverlay() // ensure overlay exists
      const fieldsListEl = overlay.querySelector("#magic-fill-fields-list")
      if (!fieldsListEl) return

      fieldsListEl.innerHTML = ""

      if (!Array.isArray(fields) || fields.length === 0) {
        const p = document.createElement("div")
        p.className = "text-xs text-gray-500 px-3 py-2"
        p.textContent = "No fields to display"
        fieldsListEl.appendChild(p)

        overlay.__mf_total = 0
        overlay.__mf_AiReportedCount = 0
        const countEl = overlay.querySelector("#modal-secondary-message")
        if (countEl) countEl.textContent = `0 / 0`
        updateButtonState("RUNNING")
        return
      }

      fields.forEach((f) => {
        const li = document.createElement("div")
        li.className = "magic-fill-field-item flex items-center py-1"
        li.setAttribute("data-field", f)
        li.setAttribute("role", "listitem")
        li.innerHTML = `
          <div 
            class="w-3 h-3 rounded-full border border-gray-400 
                  flex items-center justify-center font-bold text-xs 
                  leading-none text-white shrink-0 mr-2 magic-fill-dot" 
            aria-hidden="true"
          ></div>
          <div 
            class="magic-fill-field-item-content text-xs truncate flex-grow min-w-0 -mt-px"
          >
            ${escapeHtml(f)}
          </div>
        `
        li.dataset.reported = "false"
        fieldsListEl.appendChild(li)
      })

      overlay.__mf_total = fields.length
      overlay.__mf_AiReportedCount = 0

      const countEl = overlay.querySelector("#modal-secondary-message")
      if (countEl) countEl.textContent = `0 / ${fields.length}`
      updateButtonState("RUNNING")
    }

    // --- UPDATE SINGLE FIELD ---
    function updateFieldFromAi(fieldName, fieldValue) {
      if (!overlay) return
      const li = overlay.querySelector(`[data-field="${cssEscape(fieldName)}"]`)
      if (!li) return
      const dot = li.querySelector(".magic-fill-dot")
      if (!dot) return

      dot.scrollIntoView({ block: "nearest", behavior: "smooth" })
      const prevReported = li.dataset.reported === "true"

      dot.classList.toggle("bg-blue-500", !!fieldValue)
      dot.classList.toggle("bg-red-500", !fieldValue)

      const nameEl = li.querySelector(".magic-fill-field-item-content")
      if (nameEl) {
        nameEl.innerHTML = `
          <span>${escapeHtml(fieldName)}</span>
          <span class="ml-1 text-gray-600">${escapeHtml(fieldValue)}</span>
        `
      }

      if (!prevReported) {
        li.dataset.reported = "true"
        overlay.__mf_AiReportedCount = (overlay.__mf_AiReportedCount || 0) + 1
      }

      const countEl = overlay.querySelector("#modal-secondary-message")
      if (countEl)
        countEl.textContent = `${overlay.__mf_AiReportedCount} / ${overlay.__mf_total} found`
    }

    // --- BUTTON STATE ---
    function updateButtonState(state) {
      // READY, RUNNING, ERROR
      if (!overlay) return
      const acceptBtn = overlay.querySelector("#magic-fill-btn-accept")
      if (!acceptBtn) return
      switch (state) {
        case "READY":
          acceptBtn.disabled = false
          break
        default:
          acceptBtn.disabled = true
      }
    }

    // --- PORT ATTACH/DETACH ---
    function attachPort(port) {
      if (!overlay) {
        console.warn(
          "ProcessingModal: overlay does not exist, cannot attach port"
        )
        return
      }

      overlay.__mf_port = port

      try {
        if (port?.onDisconnect?.addListener) {
          port.onDisconnect.addListener(() => {
            console.warn("ProcessingModal: port disconnected")
          })
        }
      } catch (e) {
        console.warn(
          "ProcessingModal: could not attach onDisconnect listener",
          e
        )
      }
    }

    // --- SET FORM DATA ---
    function setFormData(schema, content) {
      if (!overlay) return
      overlay.__mf_formSchema = schema
      overlay.__mf_formContent = content
    }

    return {
      open,
      update,
      close,
      populateFields,
      updateFieldFromAi,
      updateButtonState,
      showErrorIcon,
      showMainIcon,
      attachPort,
      setFormData
    }
  })()

  async function processUserFiles(userFiles) {
    if (userFiles.length === 0) return

    console.log(`🖼️ ${userFiles.length} file(s) selected.`)
    ProcessingModal.open("Preparing files...")

    try {
      // Convert files to JPEG and array buffers
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
      // Show modal with fields list
      ProcessingModal.update(
        "Sending fields to background process...",
        Object.keys(form.properties)
      )

      // Connect to background port
      const port = chrome.runtime.connect({ name: "MAGIC_FILL" })
      ProcessingModal.attachPort(port)

      port.onMessage.addListener((msg) => {
        if (!msg || !msg.action) return

        const el = document.getElementById("magic-fill-overlay")
        if (!el) return

        switch (msg.action) {
          case "UPDATE_PROGRESS_MESSAGE":
            ProcessingModal.update(msg.content)
            break
          case "UPDATE_FIELD_STATUS":
            ProcessingModal.updateFieldFromAi(
              msg.content.field,
              msg.content.value
            )
            break
          case "ERROR":
            ProcessingModal.showErrorIcon()
            ProcessingModal.updateButtonState("ERROR")
            ProcessingModal.update(msg.content)
            break
          case "DONE":
            ProcessingModal.setFormData(form, msg.content)
            ProcessingModal.showMainIcon()
            ProcessingModal.updateButtonState("READY")
            ProcessingModal.update("AI model finished")
            break
        }
      })

      port.postMessage({
        action: "START_PROCESSING",
        content: { form, files }
      })
    } catch (error) {
      console.error("❌ Error processing files:", error)
      ProcessingModal.showErrorIcon()
      ProcessingModal.updateButtonState("ERROR")
      ProcessingModal.update("An error occurred while processing.")
    }
  }

  async function handleFileChoice() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = "image/*"
    input.style.display = "none"
    input.onchange = async function (event) {
      const userFiles = Array.from(event.target.files)
      processUserFiles(userFiles)
    }
    document.body.appendChild(input)
    input.click()
  }

  async function handleCameraChoice() {
    const overlay = document.createElement("div")
    overlay.id = "magic-fill-camera-overlay"
    overlay.className =
      "fixed inset-0 flex items-center justify-center z-[99999] bg-black/30 backdrop-blur-sm"
    overlay.innerHTML = CAMERA_MODAL_HTML
    document.body.appendChild(overlay)

    const video = overlay.querySelector("#camera-stream")
    const captureBtn = overlay.querySelector("#camera-capture")
    const cancelBtn = overlay.querySelector("#camera-cancel")

    let stream

    const removeOverlay = () => {
      overlay.remove()
      stream?.getTracks().forEach((track) => track.stop())
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
      video.srcObject = stream
      await video.play()
    } catch (err) {
      console.error("❌ Camera access denied or not available:", err)
      removeOverlay()
      return
    }

    captureBtn.addEventListener("click", async () => {
      if (!video.videoWidth || !video.videoHeight) {
        console.warn("⚠️ Video not ready yet")
        return
      }

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0)

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("❌ Failed to capture image")
            return
          }
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
            type: "image/jpeg"
          })
          console.log("📸 Captured file:", file)
          processUserFiles([file])
        },
        "image/jpeg",
        0.95
      )

      removeOverlay()
    })

    cancelBtn.addEventListener("click", () => {
      console.log("❌ Camera canceled")
      removeOverlay()
    })
  }

  // --- CHOICE MODAL ---
  function openChoiceModal() {
    const overlay = document.createElement("div")
    overlay.id = "magic-fill-choice-overlay"
    overlay.className =
      "fixed inset-0 flex items-center justify-center z-[99999] bg-black/30 backdrop-blur-sm"
    overlay.innerHTML = CHOICE_MODAL_HTML
    document.body.appendChild(overlay)

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        console.log("🟦 Clicked outside modal — closing")
        removeOverlay()
      }
    })

    const removeOverlay = () => overlay.remove()

    // --- Handlers ---
    overlay.querySelector("#choice-file").addEventListener("click", () => {
      handleFileChoice()
      removeOverlay()
    })

    overlay.querySelector("#choice-camera").addEventListener("click", () => {
      handleCameraChoice()
      removeOverlay()
    })
  }

  // --- ENTRY POINT ---
  openChoiceModal()

  // HELPERS
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
