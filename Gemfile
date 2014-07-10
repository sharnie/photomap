source 'http://rubygems.org'
ruby "2.1.2"

gem 'sinatra'
gem 'activerecord', require: 'active_record'
gem 'sinatra-activerecord', require: 'sinatra/activerecord'
gem 'instagram'
gem 'twitter'
gem 'rake'
gem 'require_all'
gem 'dotenv'

group :production do
  gem 'pg', '~> 0.17.1'
end

group :test, :development do
  gem 'shotgun'
  gem 'sqlite3'
  gem 'pry'
  gem 'rspec'
end
