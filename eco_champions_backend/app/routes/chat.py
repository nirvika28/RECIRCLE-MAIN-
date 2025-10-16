from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..socket import socketio
from ..models import User, ChatMessage
from ..utils.decorators import jwt_required_json, premium_required

chat_bp = Blueprint("chat", __name__)


@chat_bp.get("/community")
@jwt_required_json
def list_community_users():
	user = User.query.get(get_jwt_identity())
	if not user:
		return jsonify({"error": "User not found"}), 404
	users = User.query.filter(User.community == user.community, User.id != user.id).all()
	return jsonify([{ "id": str(u.id), "name": u.name, "community": u.community } for u in users])


@chat_bp.get("/global")
@premium_required
def list_global_users():
	current_user = User.query.get(get_jwt_identity())
	users = User.query.filter(User.id != current_user.id).all()
	return jsonify([{ "id": str(u.id), "name": u.name, "community": u.community } for u in users])


@chat_bp.get("/conversation/<user_id>")
@jwt_required_json
def conversation(user_id):
	me = User.query.get(get_jwt_identity())
	other = User.query.get(user_id)
	if not other:
		return jsonify({"error": "User not found"}), 404
	# non-premium restriction
	if not me.is_premium and me.community != other.community:
		return jsonify({"error": "Free users can only chat within community"}), 403

	msgs = ChatMessage.query.filter(
		((ChatMessage.sender_id == me.id) & (ChatMessage.receiver_id == other.id)) |
		((ChatMessage.sender_id == other.id) & (ChatMessage.receiver_id == me.id))
	).order_by(ChatMessage.timestamp.asc()).all()

	return jsonify([
		{
			"id": str(m.id),
			"from": str(m.sender_id),
			"to": str(m.receiver_id),
			"message": m.message,
			"timestamp": m.timestamp.isoformat(),
		}
		for m in msgs
	])


@chat_bp.post("/message")
@jwt_required_json
def send_message():
	me = User.query.get(get_jwt_identity())
	data = request.get_json() or {}
	to = data.get("to")
	message = data.get("message")
	other = User.query.get(to)
	if not other:
		return jsonify({"error": "User not found"}), 404
	if not message:
		return jsonify({"error": "Message required"}), 400

	if not me.is_premium and me.community != other.community:
		return jsonify({"error": "Free users can only chat within community"}), 403

	msg = ChatMessage(sender_id=me.id, receiver_id=other.id, message=message)
	db.session.add(msg)
	db.session.commit()

	return jsonify({"id": str(msg.id)}), 201


@chat_bp.delete("/message/<message_id>")
@jwt_required_json
def delete_message(message_id):
	me = User.query.get(get_jwt_identity())
	msg = ChatMessage.query.get(message_id)
	if not msg:
		return jsonify({"error": "Message not found"}), 404
	# Allow only sender to delete their own message
	if str(msg.sender_id) != str(me.id):
		return jsonify({"error": "Not allowed"}), 403
	try:
		# capture ids for emit
		deleted_id = str(msg.id)
		chat_between = {"from": str(msg.sender_id), "to": str(msg.receiver_id)}
		db.session.delete(msg)
		db.session.commit()
		# Emit real-time deletion event to clients
		socketio.emit("message_deleted", {"id": deleted_id, **chat_between}, broadcast=True)
		return jsonify({"ok": True}), 200
	except Exception:
		return jsonify({"error": "Failed to delete"}), 500
