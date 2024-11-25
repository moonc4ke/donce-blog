class AddShortBodyToBlogPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :blog_posts, :short_body, :string, limit: 100
  end
end
