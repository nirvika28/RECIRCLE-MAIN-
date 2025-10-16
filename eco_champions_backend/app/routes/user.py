from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_json
from ..models import User

user_bp = Blueprint("user", __name__)


@user_bp.get("/profile")
@jwt_required_json
def profile():
	user_id = get_jwt_identity()
	user = User.query.get(user_id)
	if not user:
		return jsonify({"error": "User not found"}), 404
	return jsonify({
		"id": str(user.id),
		"name": user.name,
		"email": user.email,
		"community": user.community,
		"isPremium": user.is_premium,
		"ecoCoins": user.eco_coins,
		"role": user.role,
	}), 200
