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
    "heightInput",
    "progressBar",
    "progressText",
    "progressContainer"
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
    const files = Array.from(event.target.files)
    if (!files.length) return

    this.progressContainerTarget.classList.remove('hidden')

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images[]', file)
    })

    if (this.hasTempKeyValue) {
      formData.append('temp_key', this.tempKeyValue)
    }

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', this.updateProgress.bind(this))

    xhr.onload = () => {
      if (xhr.status === 200) {
        Turbo.renderStreamMessage(xhr.responseText)
        if (this.hasTempKeyValue && this.hasImageIdsTarget) {
          const match = xhr.responseText.match(/image_(\d+)/)
          if (match) {
            const blobId = match[1]
            const currentIds = this.imageIdsTarget.value.split(',').filter(Boolean)
            currentIds.push(blobId)
            this.imageIdsTarget.value = currentIds.join(',')
          }
        }
      } else {
        this.handleUploadError(xhr.responseText)
      }
      this.resetProgress()
      event.target.value = ''
    }

    xhr.onerror = () => {
      this.handleUploadError()
      this.resetProgress()
      event.target.value = ''
    }

    xhr.open('POST', this.uploadUrlValue)
    xhr.setRequestHeader('X-CSRF-Token', document.querySelector('[name="csrf-token"]').content)
    xhr.setRequestHeader('Accept', 'text/vnd.turbo-stream.html')
    xhr.send(formData)
  }

  updateProgress(event) {
    if (!event.lengthComputable) return

    const progress = Math.round((event.loaded / event.total) * 100)
    this.progressBarTarget.style.width = `${progress}%`
    this.progressTextTarget.textContent = `${progress}%`
  }

  resetProgress() {
    setTimeout(() => {
      this.progressContainerTarget.classList.add('hidden')
      this.progressBarTarget.style.width = '0%'
      this.progressTextTarget.textContent = '0%'
    }, 500)
  }

  handleUploadError(error) {
    const flashMessage = `
      <turbo-stream action="append" target="flash-messages">
        <template>
          <div class="flash flash--alert"
               data-controller="flash"
               data-action="animationend->flash#remove">
            <p class="flash__message">Upload failed. Please try again.</p>
          </div>
        </template>
      </turbo-stream>
    `
    Turbo.renderStreamMessage(error?.includes('<turbo-stream') ? error : flashMessage)
  }
}
