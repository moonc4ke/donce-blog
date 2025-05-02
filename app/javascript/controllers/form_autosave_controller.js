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

  setCurrentTime(event) {
    event.preventDefault()
    
    const now = new Date()
    
    // Get all the select elements for published_at
    const yearSelect = this.formTarget.querySelector('select[id$="_published_at_1i"]')
    const monthSelect = this.formTarget.querySelector('select[id$="_published_at_2i"]')
    const daySelect = this.formTarget.querySelector('select[id$="_published_at_3i"]')
    const hourSelect = this.formTarget.querySelector('select[id$="_published_at_4i"]')
    const minuteSelect = this.formTarget.querySelector('select[id$="_published_at_5i"]')
    
    // Set values to current date/time
    if (yearSelect) yearSelect.value = now.getFullYear()
    if (monthSelect) monthSelect.value = now.getMonth() + 1 // Month is 0-indexed in JS
    if (daySelect) daySelect.value = now.getDate()
    if (hourSelect) hourSelect.value = now.getHours()
    if (minuteSelect) minuteSelect.value = now.getMinutes()
    
    // Trigger change events - safely handle nulls
    const selects = [yearSelect, monthSelect, daySelect, hourSelect, minuteSelect].filter(select => select !== null && select !== undefined)
    
    selects.forEach(select => {
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    
    // Trigger the autosave
    this.saveForm()
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
