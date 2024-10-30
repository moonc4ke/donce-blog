module BlogPostsHelper
  def blog_post_image_url(image)
    # This will work in both development and production with local storage
    rails_blob_path(image, only_path: true)
  end
end
