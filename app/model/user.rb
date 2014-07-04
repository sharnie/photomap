class User < ActiveRecord::Base
  validates_presence_of :instagram_id
end