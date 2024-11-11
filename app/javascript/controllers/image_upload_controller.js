import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "input",
    "preview",
    "imageIds",
    "modal",
    "widthType",
    "heightType",
    "widthInput",
    "heightInput"
  ]

  static values = {
    uploadUrl: String,
    tempKey: { type: String, default: '' }
  }

  connect() {
    if (this.hasModalTarget) {
      document.addEventListener('click', this.handleClickOutside.bind(this))
    }
  }

  disconnect() {
    if (this.hasModalTarget) {
      document.removeEventListener('click', this.handleClickOutside.bind(this))
    }
  }

  handleClickOutside = (event) => {
    if (!this.hasModalTarget) return

    const modalContainer = this.modalTarget.querySelector('.image-modal__container')
    if (!modalContainer) return

    if (this.modalTarget.classList.contains('image-modal--visible') &&
      !modalContainer.contains(event.target) &&
      !event.target.closest('[data-action*="image-upload#insertToEditor"]')) {
      this.closeModal()
    }
  }

  toggleWidthInput() {
    const isAuto = this.widthTypeTarget.value === 'auto'
    this.widthInputTarget.disabled = isAuto
    if (isAuto) {
      this.widthInputTarget.value = ''
    }
  }

  toggleHeightInput() {
    const isAuto = this.heightTypeTarget.value === 'auto'
    this.heightInputTarget.disabled = isAuto
    if (isAuto) {
      this.heightInputTarget.value = ''
    }
  }

  insertToEditor(event) {
    event.preventDefault()
    event.stopPropagation()
    const button = event.currentTarget
    this.currentMarkdown = button.dataset.markdown
    this.openModal()
  }

  openModal() {
    if (this.hasModalTarget) {
      this.modalTarget.classList.add('image-modal--visible')
      // Reset inputs
      this.widthTypeTarget.value = 'px'
      this.heightTypeTarget.value = 'px'
      this.widthInputTarget.disabled = false
      this.heightInputTarget.disabled = false
      this.widthInputTarget.value = ''
      this.heightInputTarget.value = ''
    }
  }

  closeModal() {
    if (this.hasModalTarget) {
      this.modalTarget.classList.remove('image-modal--visible')
    }
  }

  confirmDimensions(event) {
    event.preventDefault()
    event.stopPropagation()

    const widthType = this.widthTypeTarget.value
    const heightType = this.heightTypeTarget.value
    const width = this.widthInputTarget.value
    const height = this.heightInputTarget.value

    // Parse the current markdown to get the URL
    const markdownMatch = this.currentMarkdown.match(/!\[(.*?)\]\((.*?)\)/)
    if (!markdownMatch) return

    const [_, altText, url] = markdownMatch

    // Build markdown with dimensions
    let markdownText = `![${altText}](${url}`

    const widthValue = widthType === 'auto' ? 'auto' : width
    const heightValue = heightType === 'auto' ? 'auto' : height

    // Only add dimensions if at least one is specified
    if (widthValue || heightValue) {
      markdownText += ` =${widthValue || 'auto'}x${heightValue || 'auto'}`
    }
    markdownText += ')'

    const editor = document.querySelector('.markdown-editor__textarea')
    if (editor) {
      const cursorPosition = editor.selectionStart
      const currentContent = editor.value
      const newContent = currentContent.slice(0, cursorPosition) +
        "\n" + markdownText + "\n" +
        currentContent.slice(cursorPosition)

      editor.value = newContent
      editor.dispatchEvent(new Event('input', { bubbles: true }))

      // Create and render flash message matching your existing implementation
      const flashMessage = `
        <turbo-stream action="append" target="flash-messages">
          <template>
            <div class="flash flash--notice"
                 data-controller="flash"
                 data-action="animationend->flash#remove">
              <p class="flash__message">✓ Image inserted into editor</p>
            </div>
          </template>
        </turbo-stream>
      `
      Turbo.renderStreamMessage(flashMessage)
    }

    this.closeModal()
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
        if (this.hasTempKeyValue && this.hasImageIdsTarget) {
          const blobId = html.match(/image_(\d+)/)[1]
          const currentIds = this.imageIdsTarget.value.split(',').filter(Boolean)
          currentIds.push(blobId)
          this.imageIdsTarget.value = currentIds.join(',')
        }
        event.target.value = ''
      })
      .catch(error => {
        console.error('Upload failed:', error)
        alert('Failed to upload images. Please try again.')
      })
  }
}
