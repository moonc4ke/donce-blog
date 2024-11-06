import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String,
    confirm: String
  }

  async confirmAndDelete(event) {
    event.preventDefault()

    if (confirm(this.confirmValue)) {
      const response = await fetch(this.urlValue, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        },
        credentials: 'same-origin'
      })

      if (response.ok) {
        const frame = this.element.closest('turbo-frame')
        if (frame) {
          frame.remove()
        }
      }
    }
  }
}
