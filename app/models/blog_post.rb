class BlogPost < ApplicationRecord
  has_many_attached :images

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
