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

  def featured_projects
    [
      {
        title: "Breezit backend and platform work",
        summary: "Backend services, vendor and admin platforms, v2 architecture, and AI customer communication systems across foxyBackend and FoxyVendor.",
        tags: [ "foxyBackend", "FoxyVendor", "TypeScript", "MongoDB" ],
        url: "https://justbreezit.com/"
      },
      {
        title: "PM2 Dashboard",
        summary: "Rails ops dashboard for logs, deployments, health checks, database snapshots, recovery workflows, and large-log debugging.",
        tags: [ "Rails", "PM2", "Kamal", "SQLite" ]
      },
      {
        title: "Slack AI Analyzer",
        summary: "Internal Slack bot that connects Codex, Claude Code, PM2 logs, read-only production analysis, screenshots, and follow-up context.",
        tags: [ "Codex", "Claude Code", "Slack", "Bash" ]
      },
      {
        title: "AI assisted development workflows",
        summary: "Autopilot loops, roadmap orchestration, review loops, replay tooling, and synthetic replay tests for AI generated code.",
        tags: [ "Autopilot Loops", "Synthetic Replay", "Reviews" ]
      },
      {
        title: "Linux and self-hosting",
        summary: "Arch Linux, Neovim, Docker, Kamal, Caddy, and home-server setups that keep the boring parts boring enough to trust.",
        tags: [ "Arch Linux", "Neovim", "Docker", "Caddy" ]
      }
    ]
  end
end
