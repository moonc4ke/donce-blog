module MarkdownHelper
  def markdown(text)
    return "" if text.blank?

    renderer = MarkdownRenderer.new(
      filter_html: false,
      hard_wrap: true,
      link_attributes: { rel: "nofollow", target: "_blank" }
    )

    markdown = Redcarpet::Markdown.new(renderer,
      autolink: true,
      space_after_headers: true,
      fenced_code_blocks: true,
      tables: true,
      hard_wrap: true,
      highlight: true,
      strikethrough: true,
      superscript: true
    )

    rendered_html = markdown.render(text)

    helpers.sanitize(rendered_html,
      tags: %w[p br img h1 h2 h3 h4 h5 h6 strong em a ul ol li blockquote pre code table tr td th tbody thead span div],
      attributes: %w[href src class alt title style])
  end

  def safe_blog_content(blog_post)
    return "" if blog_post.nil?

    # First prepare the markdown with correct image URLs
    prepared_content = prepare_markdown(blog_post)
    # Then render and sanitize the markdown
    markdown(prepared_content)
  end

  private

  def helpers
    ActionController::Base.helpers
  end
end
