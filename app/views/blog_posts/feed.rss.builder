xml.instruct! :xml, version: "1.0"
xml.rss version: "2.0" do
  xml.channel do
    xml.title "donce.dev"
    xml.description "Latest blog posts from donce.dev"
    xml.link blog_posts_url

    @blog_posts.each do |post|
      xml.item do
        xml.title post.title
        xml.description post.short_body
        xml.pubDate post.published_at.to_fs(:rfc822)
        xml.link blog_post_url(post)
        xml.guid blog_post_url(post)
      end
    end
  end
end
