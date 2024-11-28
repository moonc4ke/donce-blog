import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "code"]

  async copy() {
    const code = this.codeTarget.textContent

    try {
      await navigator.clipboard.writeText(code)
      this.buttonTarget.textContent = 'Copied!'
      this.buttonTarget.classList.add('code-block__copy-btn--copied')

      setTimeout(() => {
        this.buttonTarget.textContent = 'Copy'
        this.buttonTarget.classList.remove('code-block__copy-btn--copied')
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      this.buttonTarget.textContent = 'Failed!'

      setTimeout(() => {
        this.buttonTarget.textContent = 'Copy'
      }, 2000)
    }
  }
}
