import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "menu", "links"]
  static outlets = ["main-content", "footer"]

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
    this.buttonTarget.textContent = "ESC"
    this.menuTarget.classList.add("nav-menu--open")
    this.linksTarget.classList.add("nav-menu__links--open")
    if (this.hasMainContentOutlet) this.mainContentOutletElement.style.display = "none"
    if (this.hasFooterOutlet) this.footerOutletElement.style.display = "none"
    document.body.style.overflow = "hidden"
  }

  closeMenu() {
    this.buttonTarget.textContent = "MENU"
    this.menuTarget.classList.remove("nav-menu--open")
    this.linksTarget.classList.remove("nav-menu__links--open")
    if (this.hasMainContentOutlet) this.mainContentOutletElement.style.display = "block"
    if (this.hasFooterOutlet) this.footerOutletElement.style.display = "block"
    document.body.style.overflow = ""
  }
}
