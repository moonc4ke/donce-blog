require "octokit"

class ProjectsController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])

  GITHUB_USERNAME = "moonc4ke"

  def index
    # check_rate_limit
    @current_projects = fetch_pinned_repositories
    @completed_projects = fetch_completed_repositories
    @config_projects = fetch_config_repositories
    @self_hosted_projects = fetch_self_hosted_repositories
  rescue Octokit::Error => e
    Rails.logger.error "GitHub API Error: #{e.message}"
    @error = "Unable to fetch projects at this time."
  end

  private

  def check_rate_limit
    client = github_client
    puts "Rate Limit: #{client.rate_limit.limit}"
    puts "Remaining: #{client.rate_limit.remaining}"
    puts "Resets at: #{client.rate_limit.resets_at}"
  end

  def github_client
    @github_client ||= Octokit::Client.new(
      access_token: ENV["GITHUB_ACCESS_TOKEN"],
      auto_paginate: true,
      per_page: 100
    ).tap do |client|
      # Enable conditional requests to save on rate limits
      client.auto_paginate = true
      client.default_media_type = "application/vnd.github.mercy-preview+json"
    end
  end

  def cached_repositories
    Rails.cache.fetch("github_repos_#{GITHUB_USERNAME}", expires_in: 12.hours) do
      github_client.repositories(GITHUB_USERNAME)
    end
  end

  def fetch_pinned_repositories
    # Fetch repositories marked as "current" using topics
    cached_repositories.select do |repo|
      repo.topics&.include?("current-focus")
    end
  end

  def fetch_completed_repositories
    github_client.repositories(GITHUB_USERNAME).select do |repo|
      repo.topics&.include?("completed")
    end
  end

  def fetch_config_repositories
    github_client.repositories(GITHUB_USERNAME).select do |repo|
      repo.topics&.include?("config")
    end
  end

  def fetch_self_hosted_repositories
    github_client.repositories(GITHUB_USERNAME).select do |repo|
      repo.topics&.include?("self-hosted")
    end
  end
end
