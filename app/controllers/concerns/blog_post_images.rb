module BlogPostImages
  extend ActiveSupport::Concern

  included do
    before_action :validate_images, only: [ :attach_images ]
  end

  def attach_images
    @blobs = process_images

    if params[:temp_key].present?
      session[:temp_image_ids] ||= []
      session[:temp_image_ids].concat(@blobs.map(&:id))
    else
      @blog_post&.images&.attach(@blobs)
    end

    respond_to do |format|
      format.turbo_stream { render_turbo_stream_response }
    end
  rescue StandardError => e
    handle_upload_error(e)
  end

  private

  def validate_images
    return if params[:images]&.any?

    render turbo_stream: turbo_stream.append("flash-messages",
      partial: "shared/flash",
      locals: {
        type: "alert",
        message: "No images selected"
      }
    ), status: :unprocessable_entity
  end

  def process_images
    params[:images].map do |image|
      ImageProcessorService.process(image)
    end
  end

  def render_turbo_stream_response
    render turbo_stream: [
      *image_preview_streams,
      flash_message_stream
    ]
  end

  def image_preview_streams
    @blobs.map do |blob|
      turbo_stream.append("images_list",
        partial: "image_preview",
        locals: {
          temp_key: params[:temp_key],
          blob: blob,
          blog_post: @blog_post
        }
      )
    end
  end

  def flash_message_stream
    turbo_stream.append("flash-messages",
      partial: "shared/flash",
      locals: {
        type: "notice",
        message: success_message
      }
    )
  end

  def success_message
    if @blobs.size == 1
      "✓ #{@blobs.first.filename} uploaded successfully"
    else
      "✓ #{@blobs.size} images uploaded successfully"
    end
  end

  def handle_upload_error(error)
    Rails.logger.error "Image upload failed: #{error.message}"
    Rails.logger.error error.backtrace.join("\n")

    render turbo_stream: turbo_stream.append("flash-messages",
      partial: "shared/flash",
      locals: {
        type: "alert",
        message: "Failed to upload images: #{error.message}"
      }
    ), status: :unprocessable_entity
  end
end
