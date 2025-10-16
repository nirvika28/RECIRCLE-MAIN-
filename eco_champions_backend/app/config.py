import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
	SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
	JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
	SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///eco_champions.db")
	SQLALCHEMY_TRACK_MODIFICATIONS = False

	JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

	CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

	# Socket.IO message queue (optional for scaling)
	SOCKETIO_MESSAGE_QUEUE = os.getenv("REDIS_URL")

	# Uploads
	CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")
	UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

	# Mail (optional)
	MAIL_SERVER = os.getenv("MAIL_SERVER")
	MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
	MAIL_USERNAME = os.getenv("MAIL_USERNAME")
	MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
	MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
	MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
