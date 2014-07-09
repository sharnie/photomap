class ProfileController < ApplicationController
  
  get "profile/:username" do

    erb :"profile/show"
  end
end