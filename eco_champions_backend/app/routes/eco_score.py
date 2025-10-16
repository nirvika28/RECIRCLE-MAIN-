from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_json
from ..utils.coin_manager import award_coins
from ..models import User

eco_score_bp = Blueprint("eco", __name__)


@eco_score_bp.post("/award")
@jwt_required_json
def award():
	data = request.get_json() or {}
	amount = int(data.get("amount", 0))
	reason = data.get("reason", "Manual Award")
	user_id = get_jwt_identity()
	user = award_coins(user_id, amount, reason)
	return jsonify({
		"id": str(user.id),
		"ecoCoins": user.eco_coins,
		"role": user.role,
	}), 200
