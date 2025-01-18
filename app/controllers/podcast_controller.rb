class PodcastController < ApplicationController
  allow_unauthenticated_access(only: [ :index ])

  def index
    @episodes = [
      {
        title: "Ar vis dar aktualu dirbti programuotoju?",
        description: "Diskutuojame apie dabartinio IT sektoriaus iššūkius ir ne tik. Atsakysime į pagrindinį klausimą - ar vis dar aktualu būti programuotoju.",
        youtube_id: "p6ReNQuf7wo",
        published_at: "2024-11-04"
      }
    ]
  end
end
