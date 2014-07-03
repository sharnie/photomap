class ApplicationController < Sinatra::Base
  register Sinatra::ActiveRecordExtension
  enable :sessions
  set :session_secret, "*@&%#*dnwjeoi#912wenuk"
  set :views, Proc.new { File.join(root, "../views/") }

  Instagram.configure do |config|
    config.client_id = ENV['CLIENT_ID']
    config.client_secret = ENV['CLIENT_SECRET']
  end

  before do
    CLIENT = Instagram.client(:access_token => session[:access_token])
  end

  def current_user
    User.find_by(instagram_id: session[:instagram_id])
  end

  def user_signed_in?
    !!current_user
  end

  def check_if_user_email_exists
    if user_signed_in?
      user = User.find_by(instagram_id: CLIENT.user.id)

      if user.email.nil? || user.email.empty?
        redirect :'account/edit'
      end
    end
  end

  CALLBACK_URL = "http://localhost:3000/oauth/callback"
end