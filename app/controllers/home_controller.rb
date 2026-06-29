class HomeController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])
  include ProjectsHelper

  def index
    @recent_posts = BlogPost.published.sorted.first(4)
    @featured_projects = featured_projects
  end
end
