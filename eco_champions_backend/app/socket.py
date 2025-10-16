from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room
from .config import Config

# Use Redis queue if provided for scaling
socketio = SocketIO(async_mode="eventlet", message_queue=Config.SOCKETIO_MESSAGE_QUEUE, cors_allowed_origins="*")


@socketio.on("connect")
def handle_connect():
	emit("connect", {"message": "connected"})


@socketio.on("disconnect")
def handle_disconnect():
	# No payload required
	pass


@socketio.on("send_message")
def handle_send_message(data):
	# Expected: {"to": userId, "from": userId, "message": str}
	emit("receive_message", data, broadcast=True)
