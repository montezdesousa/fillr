;(function () {
  function fillForm(form, content) {
    console.log(`🖊️ Filling form with content: ${JSON.stringify(content)}`)
    let filledCount = 0
    form.forEach((item) => {
      const targetField =
        document.querySelector(`[name="${item.name}"]`) ||
        document.getElementById(item.name)
      if (!targetField) {
        console.log(`⚠️ Field not found in DOM: ${item.name}`)
      }
      const value = content[item.name]
      if (value === undefined) {
        console.log(`⚠️ No content for field: ${item.name}`)
        return
      }
      targetField.value = value
      filledCount++
      targetField.dispatchEvent(new Event("input", { bubbles: true }))
      targetField.dispatchEvent(new Event("change", { bubbles: true }))
    })
    return filledCount
  }

  function getForm() {
    const form = []
    const fields = document.querySelectorAll(
      'input:not([type="submit"]):not([type="hidden"]), textarea, select'
    )
    fields.forEach((field, index) => {
      let labelText = ""
      if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`)
        if (label) labelText = label.textContent.trim()
      }
      if (!labelText && field.placeholder) labelText = field.placeholder.trim()
      if (!labelText && field.name) labelText = field.name.trim()
      if (labelText) {
        form.push({
          index: index,
          type: field.type || field.tagName.toLowerCase(),
          label: labelText,
          name: field.name || field.id || `field_${index}`
        })
      }
    })
    return form
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file) // "data:image/png;base64,...."
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

        try {
          const b64Files = await Promise.all(
            userFiles.map(async (file) => ({
              name: file.name,
              type: file.type,
              data: await fileToDataUrl(file)
            }))
          )
          const form = getForm()
          const response = await chrome.runtime.sendMessage({
            action: "PROCESS_FILES",
            form: form,
            files: b64Files
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
