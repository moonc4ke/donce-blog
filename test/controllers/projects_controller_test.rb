require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  FakeGithubRepo = Struct.new(
    :topics,
    :html_url,
    :name,
    :description,
    :stargazers_count,
    :language,
    keyword_init: true
  )

  setup do
    Rails.cache.clear
  end

  test "renders featured work when GitHub projects are unavailable" do
    cached_repositories_overridden = false

    ProjectsController.define_method(:cached_repositories) do
      raise Octokit::Unauthorized.new
    end
    cached_repositories_overridden = true

    get projects_path

    assert_response :success
    assert_select "h2", "Featured Work"
    assert_select ".featured-project-card h3", "PM2 Dashboard"
    assert_select ".featured-project-card", /synthetic replay tests/
    assert_select "a.featured-project-card[href='https://justbreezit.com/']"
    assert_select "h2", { text: "Current Focus", count: 0 }
    assert_select ".projects__error-message", count: 0
  ensure
    ProjectsController.remove_method(:cached_repositories) if cached_repositories_overridden
  end

  test "retries public GitHub API when configured token is rejected" do
    original_token = ENV["GITHUB_ACCESS_TOKEN"]
    github_client_overridden = false
    ENV["GITHUB_ACCESS_TOKEN"] = "bad-token"
    repo = FakeGithubRepo.new(
      topics: [ "completed" ],
      html_url: "https://github.com/moonc4ke/pm2-dashboard",
      name: "pm2-dashboard",
      description: "Rails ops dashboard",
      stargazers_count: 1,
      language: "Ruby"
    )
    token_client = Object.new.tap do |client|
      client.define_singleton_method(:default_media_type=) { |_media_type| }
      client.define_singleton_method(:repositories) { |_username| raise Octokit::Unauthorized.new }
    end
    public_client = Object.new.tap do |client|
      client.define_singleton_method(:default_media_type=) { |_media_type| }
      client.define_singleton_method(:repositories) { |_username| [ repo ] }
    end

    ProjectsController.define_method(:github_client) do |access_token = ENV["GITHUB_ACCESS_TOKEN"]|
      access_token.present? ? token_client : public_client
    end
    github_client_overridden = true

    get projects_path

    assert_response :success
    assert_select "h2", "Featured Work"
    assert_select "h2", "Completed Projects"
    assert_select ".project-card h3", "pm2-dashboard"
    assert_select ".projects__error-message", count: 0
  ensure
    ProjectsController.remove_method(:github_client) if github_client_overridden
    ENV["GITHUB_ACCESS_TOKEN"] = original_token
  end
end
