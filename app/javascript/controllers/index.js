// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
import MarkdownEditorController from "controllers/markdown_editor_controller"
eagerLoadControllersFrom("controllers", application)
application.register("markdown-editor", MarkdownEditorController)
