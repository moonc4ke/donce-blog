require "octokit"

class ProjectsController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])

  GITHUB_USERNAME = "moonc4ke"

  def index
    @current_projects = fetch_current_focus_repositories
    @completed_projects = fetch_completed_repositories
    @config_projects = fetch_config_repositories
    @self_hosted_projects = fetch_self_hosted_repositories
  rescue Octokit::Error => e
    Rails.logger.error "GitHub API Error: #{e.message}"
    @error = "Unable to fetch projects at this time."
  end

  private

  def github_client
    @github_client ||= Octokit::Client.new(
      access_token: ENV["GITHUB_ACCESS_TOKEN"],
      auto_paginate: true
    ).tap do |client|
      client.default_media_type = "application/vnd.github.mercy-preview+json"
    end
  end

  def cached_repositories
    Rails.cache.fetch("github_repos_#{GITHUB_USERNAME}", expires_in: 12.hours) do
      github_client.repositories(GITHUB_USERNAME)
    end
  end

  def fetch_current_focus_repositories
    cached_repositories.select do |repo|
      repo.topics&.include?("current-focus")
    end
  end

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
