import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash, check_password_hash
from .database import db


class User(db.Model):
	__tablename__ = "user"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	name = db.Column(db.String(100), nullable=False)
	email = db.Column(db.String(120), unique=True, nullable=False)
	password_hash = db.Column(db.String(200), nullable=False)
	community = db.Column(db.String(120))
	is_premium = db.Column(db.Boolean, default=False)
	eco_coins = db.Column(db.Integer, default=0)
	# One-time bonus flag for recycling guide checklist
	guide_bonus_claimed = db.Column(db.Boolean, default=False)
	# Optional geolocation for clustering
	latitude = db.Column(db.Float)
	longitude = db.Column(db.Float)
	role = db.Column(db.String(50), default="Eco Learner")
	created_at = db.Column(db.DateTime, default=datetime.utcnow)

	# relationships
	recycling_logs = db.relationship("RecyclingLog", backref="user", lazy=True)
	coin_transactions = db.relationship("CoinTransaction", backref="user", lazy=True)
	messages_sent = db.relationship("ChatMessage", foreign_keys='ChatMessage.sender_id', backref="sender", lazy=True)
	messages_received = db.relationship("ChatMessage", foreign_keys='ChatMessage.receiver_id', backref="receiver", lazy=True)
	project_participations = db.relationship("ProjectParticipation", backref="user", lazy=True)

	def set_password(self, password: str) -> None:
		self.password_hash = generate_password_hash(password)

	def check_password(self, password: str) -> bool:
		return check_password_hash(self.password_hash, password)


class RecyclingLog(db.Model):
	__tablename__ = "recycling_log"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	material_type = db.Column(db.String(50))
	weight = db.Column(db.Float)
	photo_url = db.Column(db.String(255))
	date = db.Column(db.DateTime, default=datetime.utcnow)


class Project(db.Model):
	__tablename__ = "project"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	title = db.Column(db.String(100))
	description = db.Column(db.Text)
	goal_material = db.Column(db.String(50))
	goal_weight = db.Column(db.Float)
	collected_weight = db.Column(db.Float, default=0)
	status = db.Column(db.String(50), default="Active")
	days_left = db.Column(db.Integer)
	created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	created_at = db.Column(db.DateTime, default=datetime.utcnow)

	participants = db.relationship("ProjectParticipation", backref="project", lazy=True)


class ProjectParticipation(db.Model):
	__tablename__ = "project_participation"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	project_id = db.Column(UUID(as_uuid=True), db.ForeignKey('project.id'))
	contributed_weight = db.Column(db.Float, default=0)
	joined_at = db.Column(db.DateTime, default=datetime.utcnow)


class ChatMessage(db.Model):
	__tablename__ = "chat_message"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	sender_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	receiver_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	message = db.Column(db.Text)
	timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class CoinTransaction(db.Model):
	__tablename__ = "coin_transaction"

	id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
	amount = db.Column(db.Integer)
	reason = db.Column(db.String(100))
	timestamp = db.Column(db.DateTime, default=datetime.utcnow)
