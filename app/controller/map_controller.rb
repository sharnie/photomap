class MapController < ApplicationController
  get '/' do
    erb :'map/index'
  end
end