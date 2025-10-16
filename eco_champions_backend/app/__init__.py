from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config
from .database import db
from .socket import socketio

migrate = Migrate()
jwt = JWTManager()


def create_app() -> Flask:
	app = Flask(__name__)
	app.config.from_object(Config)

	CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}}, supports_credentials=True)

	db.init_app(app)
	migrate.init_app(app, db)
	jwt.init_app(app)
	socketio.init_app(app, cors_allowed_origins=app.config.get("CORS_ORIGINS", "*"))

	# Register blueprints (modules may be empty placeholders initially)
	from .routes.auth import auth_bp
	from .routes.user import user_bp
	from .routes.recycling import recycling_bp
	from .routes.projects import projects_bp
	from .routes.chat import chat_bp
	from .routes.eco_score import eco_score_bp
	from .routes.trade import trade_bp
	from .routes.events import events_bp
	from .routes.community import community_bp

	app.register_blueprint(auth_bp, url_prefix="/api/auth")
	app.register_blueprint(user_bp, url_prefix="/api/user")
	app.register_blueprint(recycling_bp, url_prefix="/api/recycling")
	app.register_blueprint(projects_bp, url_prefix="/api/projects")
	app.register_blueprint(chat_bp, url_prefix="/api/chat")
	app.register_blueprint(eco_score_bp, url_prefix="/api/eco")
	app.register_blueprint(trade_bp, url_prefix="/api/trade")
	app.register_blueprint(events_bp, url_prefix="/api/events")
	app.register_blueprint(community_bp, url_prefix="/api/community")

	return app
