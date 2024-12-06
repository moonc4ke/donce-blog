import { Controller } from "@hotwired/stimulus"
import Pagy from "pagy"

export default class extends Controller {
  connect() {
    Pagy.init(this.element)
  }
}
