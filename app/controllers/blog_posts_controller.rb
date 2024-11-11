class BlogPostsController < ApplicationController
  include MarkdownHelper

  allow_unauthenticated_access(only: [ :index, :show ])
  before_action :set_blog_post, only: [ :show, :edit, :update, :destroy, :delete_image ], if: -> { params[:id].present? }

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

    # Attach any temporary blobs
    if params[:temp_image_ids].present?
      blobs = ActiveStorage::Blob.where(id: params[:temp_image_ids].split(","))
      @blog_post.images.attach(blobs)
    end

    if @blog_post.save
      redirect_to @blog_post
    else
      @temp_key = params[:temp_key]
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @blog_post.assign_attributes(blog_post_params) if params[:blog_post].present?
    render :edit
  end

  def update
    if @blog_post.update(blog_post_params)
      redirect_to @blog_post, notice: "Blog post was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @blog_post.destroy
    redirect_to root_path, notice: "Blog post was deleted."
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
    @blobs = params[:images].map do |image|
      ActiveStorage::Blob.create_and_upload!(
        io: image,
        filename: image.original_filename,
        content_type: image.content_type
      )
    end

    @blog_post = BlogPost.find(params[:id]) unless params[:temp_key].present?
    @blog_post&.images&.attach(@blobs) if @blog_post

    respond_to do |format|
      format.turbo_stream do
        renders = []

        # Add image previews
        @blobs.each do |blob|
          renders << turbo_stream.append("images_list",
            partial: "image_preview",
            locals: {
              temp_key: params[:temp_key],
              blob: blob,
              blog_post: @blog_post
            }
          )
        end

        # Add single flash message for all images
        message = if @blobs.size == 1
          "✓ #{@blobs.first.filename} uploaded successfully"
        else
          "✓ #{@blobs.size} images uploaded successfully"
        end

        renders << turbo_stream.append("flash-messages",
          partial: "shared/flash",
          locals: {
            type: "notice",
            message: message
          }
        )

        render turbo_stream: renders
      end
    end
  end

  def delete_image
    filename = nil

    if params[:temp_key].present?
      blob = ActiveStorage::Blob.find_by(id: params[:image_id])
      if blob
        filename = blob.filename
        blob.purge
      else
        @error_message = "Image not found or already deleted"
      end
    else
      @blog_post ||= BlogPost.find(params[:id])
      image = @blog_post.images.find_by(id: params[:image_id])
      if image
        filename = image.filename
        image.purge
      else
        @error_message = "Image not found or already deleted"
      end
    end

    respond_to do |format|
      format.turbo_stream do
        renders = []

        if @error_message
          renders << turbo_stream.append("flash-messages",
            partial: "shared/flash",
            locals: {
              type: "alert",
              message: @error_message
            }
          )
        else
          renders << turbo_stream.remove("image_#{params[:image_id]}")
          renders << turbo_stream.append("flash-messages",
            partial: "shared/flash",
            locals: {
              type: "notice",
              message: filename ? "✓ #{filename} removed successfully" : "✓ Image removed successfully"
            }
          )
        end

        render turbo_stream: renders
      end
    end
  end

  private

  def blog_post_params
    params.require(:blog_post).permit(:title, :body, :published_at)
  end

  def set_blog_post
    @blog_post = authenticated? ? BlogPost.find(params[:id]) : BlogPost.published.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path
  end
end
