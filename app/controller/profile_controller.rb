class ProfileController < ApplicationController
  
  get "/profile/:user_id" do
    @client = CLIENT
    @user = CLIENT.user(params[:user_id]).id

    erb :"profile/show"
  end
end