class BlogPost < ApplicationRecord
  has_many_attached :images do |attachable|
    attachable.variant :thumb,
      resize_to_limit: [ 100, 100 ],
      format: :webp,
      saver: {
        quality: 75,
        strip: true
      }

    attachable.variant :medium,
      resize_to_limit: [ 800, 800 ],
      format: :webp,
      saver: {
        quality: 80,
        strip: true
      }

    attachable.variant :large,
      resize_to_limit: [ 1200, 1200 ],
      format: :webp,
      saver: {
        quality: 85,
        strip: true
      }
  end

  validates :title, presence: true
  validates :body, presence: true
  validates :images,
            content_type: { in: %w[image/png image/jpeg image/gif image/webp], message: "must be a valid image format" },
            size: { less_than: 5.megabytes, message: "size must be under 5MB" },
            limit: { max: 10, message: "count must be 10 or less" }

  scope :sorted, -> {
    order(
      Arel.sql("CASE WHEN published_at IS NULL THEN 0 ELSE 1 END"),
      published_at: :desc,
      updated_at: :desc
    )
  }
  scope :draft, -> { where(published_at: nil) }
  scope :published, -> { where("published_at <= ?", Time.current) }
  scope :scheduled, -> { where("published_at > ?", Time.current) }

  def draft?
    published_at.nil?
  end

  def published?
    published_at? && published_at <= Time.current
  end

  def scheduled?
    published_at? && published_at > Time.current
  end
end
