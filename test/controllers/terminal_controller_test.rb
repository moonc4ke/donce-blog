require "test_helper"

class TerminalControllerTest < ActionDispatch::IntegrationTest
  test "renders the terminal with published posts for the blog command" do
    get root_path

    assert_response :success
    assert_select "[data-controller='terminal']" do |terminal|
      posts = JSON.parse(terminal.first["data-terminal-posts-value"])
      assert_includes posts.map { |post| post["title"] }, "Published Post"
    end
    assert_select "input.term__input"
    assert_select "nav.term__chips button[data-cmd='whoami']"
  end

  test "old pages redirect to the terminal" do
    %w[/home /projects /podcast /about /tools].each do |path|
      get path
      assert_redirected_to "/"
    end
  end
end
