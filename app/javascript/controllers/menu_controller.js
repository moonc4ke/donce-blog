import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "menu", "links"]

  connect() {
    this.closeMenu()
  }

  toggle() {
    if (this.buttonTarget.textContent === "MENU") {
      this.openMenu()
    } else {
      this.closeMenu()
    }
  }

  openMenu() {
    this.buttonTarget.textContent = "CLOSE"
    this.menuTarget.classList.add("nav-menu--open")
    this.linksTarget.classList.add("nav-menu__links--open")
    document.body.style.overflow = "hidden"
  }

  closeMenu() {
    this.buttonTarget.textContent = "MENU"
    this.menuTarget.classList.remove("nav-menu--open")
    this.linksTarget.classList.remove("nav-menu__links--open")
    document.body.style.overflow = ""
  }
}
