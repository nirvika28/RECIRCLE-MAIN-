from app import create_app, socketio

app = create_app()

if __name__ == "__main__":
	# For Socket.IO dev server use eventlet or gevent if installed
	socketio.run(app, host="0.0.0.0", port=5000, debug=True)
