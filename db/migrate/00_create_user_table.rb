class CreateUserTable < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string   :email
      t.string   :instagram_id
    end
  end
end