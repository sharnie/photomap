class ProfileController < ApplicationController
  
  get "/profile/:user_id" do
    @user_photos = CLIENT.user_recent_media(params[:user_id])
    @user        = CLIENT.user(params[:user_id])

    erb :"profile/show"
  end
end