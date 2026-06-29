class ProjectsController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])
  include ProjectsHelper

  def index
    @featured_projects = featured_projects
    @completed_projects = fetch_completed_repositories
    @config_projects = fetch_config_repositories
    @self_hosted_projects = fetch_self_hosted_repositories
  rescue Octokit::Error => e
    Rails.logger.error "GitHub API Error: #{e.message}"
    @error = "Unable to fetch projects at this time."
  end

  private

  def fetch_completed_repositories
    cached_repositories.select do |repo|
      repo.topics&.include?("completed")
    end
  end

  def fetch_config_repositories
    cached_repositories.select do |repo|
      repo.topics&.include?("config")
    end
  end

  def fetch_self_hosted_repositories
    cached_repositories.select do |repo|
      repo.topics&.include?("self-hosted")
    end
  end
end
