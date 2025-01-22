module ProjectsHelper
  private

  GITHUB_USERNAME = "moonc4ke"

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
end
