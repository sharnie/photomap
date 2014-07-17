require 'pry'

class MapController < ApplicationController
  get '/' do
    @user = CLIENT.user if user_signed_in?
    erb :'map/index'
  end

  get "/oauth/logout" do
    session.clear
    redirect '/'
  end

  get "/oauth/connect" do
    redirect Instagram.authorize_url(:redirect_uri => CALLBACK_URL, :scope => 'relationships likes')
  end

  # get '/oauth/twitter/connect' do
  # end

  # get '/oauth/twitter/callback' do
  #   client = Twitter::REST::Client.new do |config|
  #     config.consumer_key        = "8BPo9SH3QkcfY3HTh244L4a8j"
  #     config.consumer_secret     = "bSw80xX1hDGMcqpceaiPy9fjFfBqymJ8wcJEWagk4SAzA2eNAW"
  #     config.access_token        = "534838150-RcYP3s1Ke4b51r64IUkkdulUAPsO71XD4OjIs2Oi"
  #     config.access_token_secret = "fnr7xJkwDlTQRW1d3T2yCEqfRa1trNQi2AHTG3qhlCRS0"
  #   end
  #   binding.pry
  # end

  # redirect user after authentication on Instagram and set access token
  get "/oauth/callback" do
    response               = Instagram.get_access_token(params[:code], :redirect_uri => CALLBACK_URL)
    session[:access_token] = response.access_token
    client                 = Instagram.client(access_token: session[:access_token])
    session[:instagram_id] = client.user.id
    User.find_or_create_by(instagram_id: client.user.id)

    redirect '/'
  end

  get '/map/:lat/:lng/:radius/media_search.json' do
    content_type :json
    locations = []
    media = user_signed_in? ? CLIENT : Instagram

    media.media_search(params[:lat], params[:lng], distance: params[:radius]).each do |data|
      caption = data.caption ? data.caption.text : ''
      locations <<  {
                      latitude:             data.location.latitude,
                      longitude:            data.location.longitude,
                      location_name:        data.location.name,
                      low_resolution:       data.images.low_resolution.url,
                      standard_resolution:  data.images.standard_resolution.url,
                      caption_text:         caption,
                      id:                   data.id,
                      likes:                data.likes,
                      user_has_liked:       data.user_has_liked,
                      created_time:         data.created_time,
                      user: {   
                        id:                 data.user.id,
                        username:           data.user.username,
                        profile_picture:    data.user.profile_picture,
                        bio:                data.user.bio,
                        full_name:          data.user.full_name,
                      }
                    }

    end

    locations.to_json
  end

  get '/media/:media_id.json' do
    content_type :json
    response = CLIENT.media_item(params[:media_id])
    response.to_json
  end

  get '/like/:image_id' do
    content_type :json
    response = CLIENT.like_media(params[:image_id])
    response.to_json
  end

  get '/unlike/:image_id' do
    content_type :json
    response = CLIENT.unlike_media(params[:image_id])
    response.to_json
  end

  # GET, MODIFY RELATIONSHIP
  get '/users/:id/relationship.json' do
    content_type :json
    response = CLIENT.user_relationship(params[:id])
    response.merge({id: params[:id]}).to_json
  end

  get '/users/:id/follow.json' do
    content_type :json
    response = CLIENT.follow_user(params[:id])
    response.to_json
  end

  get '/users/:id/unfollow.json' do
    content_type :json
    response = CLIENT.unfollow_user(params[:id])
    response.to_json
  end

  get '/test' do
    erb :'map/test'
  end

  get '/map/:lat/:lng/locations.json' do
    media = user_signed_in? ? CLIENT : Instagram
    response = media.location_search(params[:lat], params[:lng])
    response.to_json
  end
end