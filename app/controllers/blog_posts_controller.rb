class BlogPostsController < ApplicationController
  include MarkdownHelper

  allow_unauthenticated_access(only: [ :index, :show ])
  before_action :set_blog_post, only: [ :show, :edit, :update, :destroy, :delete_image ]

  def index
    @blog_posts = authenticated? ? BlogPost.sorted : BlogPost.published.sorted
  end

  def show
  end

  def new
    @blog_post = BlogPost.new
    @temp_key = SecureRandom.hex(10)
  end

  def create
    @blog_post = BlogPost.new(blog_post_params)

    if params[:temp_key].present?
      temp_blobs = ActiveStorage::Blob.where(id: params[:temp_image_ids].split(","))
      temp_blobs.each do |blob|
        @blog_post.images.attach(blob)
      end
    end

    if @blog_post.save
      redirect_to @blog_post
    else
      @temp_key = params[:temp_key]
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @blog_post.update(blog_post_params)
      redirect_to @blog_post
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @blog_post.destroy
    redirect_to root_path
  end

  def preview
    if params[:content].present?
      rendered = markdown(params[:content])
      render plain: rendered
    else
      render plain: ""
    end
  end

  def attach_images
    # params.permit(:temp_key, images: [])

    if params[:temp_key].present?
      # Handle uploads for new blog posts
      @blob = ActiveStorage::Blob.create_and_upload!(
        io: params[:images].first,
        filename: params[:images].first.original_filename,
        content_type: params[:images].first.content_type
      )

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.append("image_preview",
            partial: "image_preview",
            locals: { temp_key: params[:temp_key], blob: @blob })
        end
      end
    else
      # Handle uploads for existing blog posts
      @blog_post = BlogPost.find(params[:id])
      @blog_post.images.attach(params[:images])

      respond_to do |format|
        format.turbo_stream
      end
    end
  end

  def delete_image
    if params[:temp_key].present?
      blob = ActiveStorage::Blob.find_by(id: params[:image_id])
      blob&.purge
    else
      image = @blog_post.images.find(params[:image_id])
      image.purge
    end

    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.remove("image_#{params[:image_id]}") }
    end
  end

  private

  def blog_post_params
    params.require(:blog_post).permit(:title, :body, :published_at, images: [])
  end

  def set_blog_post
    @blog_post = authenticated? ? BlogPost.find(params[:id]) : BlogPost.published.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path
  end
end
