import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview", "previewContent", "imageInput", "imagePreview"]
  static values = {
    previewUrl: String
  }

  connect() {
    this.preview()
  }

  preview() {
    if (this.hasInputTarget && this.inputTarget.value.trim()) {
      this.showPreview()
    } else {
      this.hidePreview()
    }
  }

  async showPreview() {
    try {
      const response = await fetch(this.previewUrlValue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ content: this.inputTarget.value })
      })

      const html = await response.text()
      this.previewContentTarget.innerHTML = html
      this.previewTarget.style.display = 'block'
    } catch (error) {
      console.error('Preview failed:', error)
    }
  }

  hidePreview() {
    if (this.hasPreviewTarget) {
      this.previewTarget.style.display = 'none'
    }
  }

  handleImages(event) {
    this.imagePreviewTarget.innerHTML = ''

    Array.from(event.target.files).forEach(file => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const div = document.createElement('div')
        div.className = 'image-preview__item'

        div.innerHTML = `
        <img src="${e.target.result}" 
             class="image-preview__image" 
             alt="Preview">
        <code class="image-preview__markdown">
          ![${file.name}](/rails/active_storage/blobs/redirect/${file.name})
        </code>
      `
        this.imagePreviewTarget.appendChild(div)
      }

      reader.readAsDataURL(file)
    })
  }
}
