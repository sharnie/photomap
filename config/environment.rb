ENV['SINATRA_ENV'] ||= "development"

require 'bundler/setup'
Bundler.require(:default, ENV['SINATRA_ENV'])

configure :development, :test do
  ActiveRecord::Base.establish_connection(
    :adapter  => "sqlite3",
    :database => "db/#{ENV['SINATRA_ENV']}.sqlite"
  )
end

configure :production do
  db = URI.parse(ENV['DATABASE_URL'] || 'postgres://localhost/photomap_production')

  ActiveRecord::Base.establish_connection(
      :adapter => db.scheme == 'postgres' ? 'postgresql' : db.scheme,
      :host     => db.host,
      :username => db.user,
      :password => db.password,
      :database => db.path[1..-1],
      :encoding => 'utf8'
  )
end

# ActiveRecord::Base.establish_connection(
#   :adapter  => "postgresql",
#   :database => "#{ENV['SINATRA_ENV']}"
#   # "db/#{ENV['SINATRA_ENV']}.sqlite"
# )

Dotenv.load
require_all 'app'