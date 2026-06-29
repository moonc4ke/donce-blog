require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  setup do
    Rails.cache.clear
  end

  test "renders recent posts when GitHub projects are unavailable" do
    HomeController.define_method(:fetch_current_focus_repositories) do
      raise Octokit::Unauthorized.new
    end

    get root_path

    assert_response :success
    assert_select ".blog-card__title", "Published Post"
  ensure
    HomeController.remove_method(:fetch_current_focus_repositories)
  end
end
