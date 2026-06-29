require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Rails.cache.clear
  end

  test "renders featured work when GitHub projects are unavailable" do
    ProjectsController.define_method(:fetch_completed_repositories) do
      raise Octokit::Unauthorized.new
    end

    get projects_path

    assert_response :success
    assert_select "h2", "Featured Work"
    assert_select ".featured-project-card h3", "PM2 Dashboard"
    assert_select ".featured-project-card", /synthetic replay tests/
    assert_select "a.featured-project-card[href='https://justbreezit.com/']"
    assert_select "h2", { text: "Current Focus", count: 0 }
    assert_select ".projects__error-message", "Unable to fetch projects at this time."
  ensure
    ProjectsController.remove_method(:fetch_completed_repositories)
  end
end
