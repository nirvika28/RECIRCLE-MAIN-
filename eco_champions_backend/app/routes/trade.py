from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..models import User
from ..utils.decorators import jwt_required_json
from ..utils.coin_manager import award_coins


trade_bp = Blueprint("trade", __name__)


@trade_bp.post("/finalize")
@jwt_required_json
def finalize_trade():
	"""Finalize an EcoTrade and award 50 coins to both buyer and seller.
	Expected JSON: { "buyerId": uuid, "sellerId": uuid }
	The caller must be either the buyer or the seller.
	"""
	data = request.get_json() or {}
	buyer_id = data.get("buyerId")
	seller_id = data.get("sellerId")
	if not buyer_id or not seller_id:
		return jsonify({"error": "buyerId and sellerId required"}), 400

	caller = str(get_jwt_identity())
	if caller not in (str(buyer_id), str(seller_id)):
		return jsonify({"error": "Caller must be buyer or seller"}), 403

	buyer = User.query.get(buyer_id)
	seller = User.query.get(seller_id)
	if not buyer or not seller:
		return jsonify({"error": "Buyer or seller not found"}), 404

	# Award 50 coins each
	award_coins(buyer.id, 50, "EcoTrade Finalized")
	award_coins(seller.id, 50, "EcoTrade Finalized")

	return jsonify({
		"buyer": { "id": str(buyer.id), "ecoCoins": buyer.eco_coins },
		"seller": { "id": str(seller.id), "ecoCoins": seller.eco_coins },
	}), 200


