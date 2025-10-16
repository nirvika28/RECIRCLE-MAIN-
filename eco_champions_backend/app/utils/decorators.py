from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..models import User


def jwt_required_json(fn):
	@wraps(fn)
	def wrapper(*args, **kwargs):
		try:
			verify_jwt_in_request()
		except Exception as e:
			return jsonify({"error": "Unauthorized"}), 401
		return fn(*args, **kwargs)
	return wrapper


def premium_required(fn):
	@wraps(fn)
	def wrapper(*args, **kwargs):
		verify_jwt_in_request()
		user_id = get_jwt_identity()
		user = User.query.get(user_id)
		if not user or not user.is_premium:
			return jsonify({"error": "Premium required"}), 403
		return fn(*args, **kwargs)
	return wrapper
