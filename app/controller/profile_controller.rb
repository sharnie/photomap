class ProfileController < ApplicationController
  
  get "/profile/:user_id" do
    client = Instagram.client(:access_token => session[:access_token])
    @user_photos = client.user_recent_media(params[:user_id])
    @user = client.user(params[:user_id])

    erb :"profile/show"
  end
end