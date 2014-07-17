class ProfileController < ApplicationController
  
  get "/profile/:user_id" do
    @user = CLIENT.user(params[:user_id])

    erb :"profile/show"
  end
end