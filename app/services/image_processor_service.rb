class ImageProcessorService
  def self.process(image)
    new(image).process
  end

  def initialize(image)
    @image = image
    @original_filename = image.original_filename
  end

  def process
    processed_image = optimize_image
    create_blob(processed_image)
  ensure
    processed_image&.close!
  end

  private

  def optimize_image
    ImageProcessing::MiniMagick
      .source(@image)
      .resize_to_limit(2000, 2000)
      .strip
      .format("webp")
      .quality(75)
      .define("webp:lossless=false")
      .define("webp:method=6")
      .call
  end

  def create_blob(processed_image)
    ActiveStorage::Blob.create_and_upload!(
      io: File.open(processed_image.path),
      filename: "#{File.basename(@original_filename, '.*')}.webp",
      content_type: "image/webp",
      identify: false
    )
  end
end
