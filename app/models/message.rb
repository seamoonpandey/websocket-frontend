class Message < ApplicationRecord
  after_create_commit {broadcast_messages}

  private
def broadcast_messages
  ActionCable.server.broadcast('messages_channel', {
    id:,
    body:
  })
end
end
