from datetime import datetime
from collections import Counter
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..models import RecyclingLog, User
from ..utils.decorators import jwt_required_json
from ..utils.validators import require_fields
from ..utils.coin_manager import award_coins

recycling_bp = Blueprint("recycling", __name__)


@recycling_bp.post("/log")
@jwt_required_json
def log_recycling():
	user_id = get_jwt_identity()
	data = request.get_json() or {}
	try:
		require_fields(data, ["materialType", "weight"])
	except ValueError as e:
		return jsonify({"error": str(e)}), 400

	material = data["materialType"].lower()
	weight = float(data["weight"]) if data.get("weight") is not None else 0
	photo_url = data.get("photo")

	log = RecyclingLog(user_id=user_id, material_type=material, weight=weight, photo_url=photo_url)
	db.session.add(log)
	db.session.commit()

	# coin awards
	award_coins(user_id, 5, "Log Recycling")

	# 3rd-log bonus logic
	count = RecyclingLog.query.filter_by(user_id=user_id).count()
	if count % 3 == 0:
		award_coins(user_id, 15, "Third Recycling Log Bonus")

	user = User.query.get(user_id)

	# monthly progress and pie
	start_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
	month_logs = RecyclingLog.query.filter(RecyclingLog.user_id == user_id, RecyclingLog.date >= start_month).all()
	materials = [l.material_type for l in month_logs]
	counts = Counter(materials)
	total = sum(counts.values()) or 1
	pie = [{"material": k, "percent": round(v * 100.0 / total, 2)} for k, v in counts.items()]

	monthly_progress = round(sum(l.weight for l in month_logs), 2)

	return jsonify({
		"ecoCoins": user.eco_coins,
		"role": user.role,
		"monthlyProgress": monthly_progress,
		"pieChart": pie,
	}), 201


@recycling_bp.post("/guide/check")
@jwt_required_json
def check_recycling_guide():
	user_id = get_jwt_identity()
	user = User.query.get(user_id)
	if not user:
		return jsonify({"error": "User not found"}), 404
	if user.guide_bonus_claimed:
		return jsonify({"error": "Guide bonus already claimed"}), 400

	# award once
\taward_coins(user_id, 5, "Recycling Guide Checklist")
	user.guide_bonus_claimed = True
	db.session.commit()

	return jsonify({
		"ecoCoins": user.eco_coins,
		"role": user.role,
		"guideBonusClaimed": True,
	}), 200
