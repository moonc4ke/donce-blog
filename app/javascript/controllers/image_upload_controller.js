import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview"]
  static values = {
    uploadUrl: String,
    tempKey: { type: String, default: '' }
  }

  insertToEditor(event) {
    event.preventDefault()
    const markdownText = event.currentTarget.dataset.markdown
    const editor = document.querySelector('.markdown-editor__textarea')
    if (!editor) return // Guard clause if no editor is found

    const cursorPosition = editor.selectionStart
    const currentContent = editor.value
    const newContent = currentContent.slice(0, cursorPosition) +
      "\n" + markdownText + "\n" +
      currentContent.slice(cursorPosition)

    editor.value = newContent
    // Trigger preview update
    editor.dispatchEvent(new Event('input', { bubbles: true }))

    const button = event.currentTarget
    const originalText = button.textContent
    button.textContent = "Inserted!"
    setTimeout(() => {
      button.textContent = originalText
    }, 1000)
  }

  handleUpload(event) {
    const formData = new FormData()
    Array.from(event.target.files).forEach(file => {
      formData.append('images[]', file)
    })
    if (this.hasTempKeyValue) {
      formData.append('temp_key', this.tempKeyValue)
    }

    fetch(this.uploadUrlValue, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
        'Accept': 'text/vnd.turbo-stream.html'
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error('Upload failed')
        return response.text()
      })
      .then(html => {
        Turbo.renderStreamMessage(html)
        event.target.value = ''  // Clear the file input
      })
      .catch(error => {
        console.error('Upload failed:', error)
        alert('Failed to upload images. Please try again.')
      })
  }
}
