# Override credentials key with production key from environment if available
if Rails.env.production? && ENV["RAILS_PRODUCTION_KEY"].present?
  Rails.application.credentials.key = ENV["RAILS_PRODUCTION_KEY"]
end
