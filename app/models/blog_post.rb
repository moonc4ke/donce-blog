class BlogPost < ApplicationRecord
  has_many_attached :images

  validates :title, presence: true
  validates :body, presence: true

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

  def image_urls
    images.map do |image|
      Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true)
    end
  end
end
