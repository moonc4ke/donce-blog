class HomeController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])
  include ProjectsHelper

  def index
    @current_projects = fetch_current_focus_repositories.first(4)
    @recent_posts = BlogPost.published.sorted.first(4)
  rescue Octokit::Error => e
    Rails.logger.error "GitHub API Error: #{e.message}"
    @current_projects = []
  end
end
