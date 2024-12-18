class ProjectsController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])

  def index
    # For now, we'll leave this empty until we have a Project model
    # or want to add static project data
  end
end
