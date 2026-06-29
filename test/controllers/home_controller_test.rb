require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "renders recent posts and featured work" do
    get root_path

    assert_response :success
    assert_select ".blog-card__title", "Published Post"
    assert_select "h2", "Featured Work"
    assert_select ".featured-project-card h3", "Breezit backend and platform work"
    assert_select "a.featured-project-card[href='https://justbreezit.com/']"
  end
end
