module BlogPostsHelper
  def blog_post_image_url(image)
    # This will work in both development and production with local storage
    rails_blob_path(image, only_path: true)
  end

  def prepare_markdown(blog_post)
    body = blog_post.body.dup
    
    blog_post.images.each do |image|
      # Use your existing helper method for the URL
      actual_url = blog_post_image_url(image)
      filename_pattern = image.filename.to_s
      
      # Replace any markdown image syntax containing this filename
      body.gsub!(/!\[.*?\]\([^)]*#{filename_pattern}\)/, "![#{image.filename}](#{actual_url})")
    end
    
    body
  end
end
