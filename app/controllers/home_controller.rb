class HomeController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])
  include ProjectsHelper

  def index
    @recent_posts = BlogPost.published.sorted.first(4)
    @current_projects = current_projects
  end

  private

  def current_projects
    fetch_current_focus_repositories.first(4)
  rescue Octokit::Error => e
    Rails.logger.error "GitHub API Error: #{e.message}"
    []
  end
end
