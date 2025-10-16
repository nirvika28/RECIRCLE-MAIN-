from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..models import User
from ..utils.decorators import jwt_required_json
from ..utils.mailer import send_mail


events_bp = Blueprint("events", __name__)


@events_bp.post("/register")
@jwt_required_json
def register_event():
	"""Register user for an event. If free, mark as registered. If paid,
	client should process payment first, then call this with paid=true.
	Body: { "eventId": string, "free": bool, "paid": bool, "title": string }
	"""
	data = request.get_json() or {}
	user = User.query.get(get_jwt_identity())
	if not user:
		return jsonify({"error": "User not found"}), 404
	if not data.get("eventId"):
		return jsonify({"error": "eventId required"}), 400

	free = bool(data.get("free", False))
	paid = bool(data.get("paid", False))
	if not free and not paid:
		return jsonify({"error": "Payment required for paid event"}), 400

	# Here you'd persist registration to DB; for now, acknowledge.
	# Send notification email
	title = data.get("title") or "your event"
	mail_err = send_mail(
		user.email,
		"Thank you for registering",
		f"Thank you for registering for {title}. See you there!",
	)
	if mail_err:
		# Non-blocking: return success but include mail error
		return jsonify({"registered": True, "mailError": mail_err}), 200
	return jsonify({"registered": True}), 200


