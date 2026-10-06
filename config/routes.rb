Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  resources :blog_posts do
    collection do
      post :save_draft
      delete "images/:image_id", to: "blog_posts#delete_image", as: :delete_temp_image
      post :attach_images  # For new blog posts
      get :feed, defaults: { format: :rss }
    end
    member do
      delete "images/:image_id", to: "blog_posts#delete_image", as: :delete_image
      post :attach_images  # For existing blog posts
    end
  end

  post "preview", to: "blog_posts#preview"

  get "blog", to: "blog_posts#index"

  # The old pages are gone; the terminal knows everything now.
  %w[home projects podcast about tools].each do |page|
    get page, to: redirect("/")
  end

  root "terminal#index"
end
