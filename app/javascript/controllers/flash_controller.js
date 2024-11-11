import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  initialize() {
    setTimeout(() => {
      this.fadeOut()
    }, 3000)
  }

  fadeOut() {
    this.element.classList.add('flash--fade-out')
  }

  remove(event) {
    if (event.animationName === 'flash-fade-out') {
      this.element.remove()
    }
  }
}
