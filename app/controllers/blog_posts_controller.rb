class BlogPostsController < ApplicationController
  include MarkdownHelper
  include BlogPostImages

  allow_unauthenticated_access(only: [ :index, :show ])
  before_action :set_blog_post, only: [ :show, :edit, :update, :destroy, :delete_image ], if: -> { params[:id].present? }

  def index
    @blog_posts = authenticated? ? BlogPost.sorted : BlogPost.published.sorted
  end

  def show
  end

  def new
    @blog_post = BlogPost.new(
      title: session[:draft_title],
      body: session[:draft_body]
    )
    @temp_key = session[:temp_key] || SecureRandom.hex(10)
    session[:temp_key] = @temp_key

    if session[:temp_image_ids].present?
      existing_blobs = ActiveStorage::Blob.where(id: session[:temp_image_ids])
      session[:temp_image_ids] = existing_blobs.pluck(:id)
      @temp_blobs = existing_blobs
    end
  end

  def save_draft
    session[:draft_title] = params[:blog_post][:title]
    session[:draft_body] = params[:blog_post][:body]

    head :ok
  end

  def create
    @blog_post = BlogPost.new(blog_post_params)
    @temp_key = params[:temp_key]

    if @blog_post.save
      if session[:temp_image_ids].present?
        blobs = ActiveStorage::Blob.where(id: session[:temp_image_ids])
        @blog_post.images.attach(blobs)
      end

      session.delete(:temp_image_ids)
      session.delete(:temp_key)
      session.delete(:draft_title)
      session.delete(:draft_body)

      redirect_to @blog_post, notice: "Blog post was successfully created."
    else
      # Important: Set @temp_blobs for re-rendering
      @temp_blobs = ActiveStorage::Blob.where(id: session[:temp_image_ids]) if session[:temp_image_ids].present?

      # Keep the form data in session
      session[:temp_key] = @temp_key
      session[:draft_title] = @blog_post.title
      session[:draft_body] = @blog_post.body

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
    @blog_post = BlogPost.find(params[:id]) unless params[:temp_key].present?
    super
  end

  def delete_image
    flash_message = nil

    if params[:temp_key].present?
      blob = ActiveStorage::Blob.find_by(id: params[:image_id])
      if blob
        session[:temp_image_ids].delete(params[:image_id].to_i)
        blob.purge
        flash_message = "✓ #{blob.filename} removed successfully"
      end
    else
      @blog_post = BlogPost.find(params[:id])
      image = @blog_post.images.find_by(id: params[:image_id])
      if image
        filename = image.filename
        image.purge
        flash_message = filename ? "✓ #{filename} removed successfully" : "✓ Image removed successfully"
      end
    end

    if flash_message
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.remove("image_#{params[:image_id]}"),
            turbo_stream.append("flash-messages",
              partial: "shared/flash",
              locals: { type: "notice", message: flash_message }
            )
          ]
        end
      end
    else
      render turbo_stream: turbo_stream.append("flash-messages",
        partial: "shared/flash",
        locals: { type: "alert", message: "Image not found" }
      ), status: :not_found
    end

  rescue => e
    render turbo_stream: turbo_stream.append("flash-messages",
      partial: "shared/flash",
      locals: { type: "alert", message: "Failed to remove image: #{e.message}" }
    ), status: :unprocessable_entity
  end

  private

  def blog_post_params
    params.require(:blog_post).permit(:title, :short_body, :body, :published_at)
  end

  def set_blog_post
    @blog_post = authenticated? ? BlogPost.find(params[:id]) : BlogPost.published.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path
  end
end
