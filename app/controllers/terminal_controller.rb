class TerminalController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])

  layout "terminal"

  def index
    @posts = BlogPost.published.sorted.first(8).map do |post|
      {
        title: post.title,
        short: post.short_body,
        date: post.published_at.to_date.iso8601,
        url: blog_post_path(post)
      }
    end
  end
end
