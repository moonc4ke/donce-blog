import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview", "previewContent", "imageInput", "imagePreview"]
  static values = {
    previewUrl: String
  }

  connect() {
    this.timeout = null
    this.preview()
  }

  preview() {
    clearTimeout(this.timeout)

    if (this.hasInputTarget && this.inputTarget.value.trim()) {
      this.timeout = setTimeout(() => {
        this.showPreview()
      }, 500)
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

  disconnect() {
    clearTimeout(this.timeout)
  }
}
