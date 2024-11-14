import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form"]

  connect() {
    this.autosave = debounce(this.saveForm.bind(this), 1000)
    this.formTarget.addEventListener("input", this.autosave)
  }

  disconnect() {
    if (this.formTarget) {
      this.formTarget.removeEventListener("input", this.autosave)
    }
  }

  async saveForm() {
    const form = this.formTarget
    const formData = new FormData(form)

    try {
      await fetch(this.saveDraftPath(), {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
        },
      })
    } catch (error) {
      console.error("Failed to save draft:", error)
    }
  }

  saveDraftPath() {
    return "/blog_posts/save_draft"
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
