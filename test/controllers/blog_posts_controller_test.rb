require "test_helper"

class BlogPostsControllerTest < ActionDispatch::IntegrationTest
  test "should get new blog post page" do
    get new_blog_post_path

    assert_redirected_to new_session_url
    User.create!(email_address: "foo@bar.com", password: "password")
    post session_url, params: { email_address: "foo@bar.com", password: "password" }
    assert_redirected_to new_blog_post_url
    follow_redirect!
    assert_response :success

    delete session_url
    get new_blog_post_path
    assert_redirected_to new_session_url
  end
end
