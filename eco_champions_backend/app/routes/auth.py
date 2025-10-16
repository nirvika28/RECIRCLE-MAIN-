from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from ..database import db
from ..models import User
from ..utils.validators import require_fields

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/signup")
def signup():
	data = request.get_json() or {}
	try:
		require_fields(data, ["name", "email", "password"])
	except ValueError as e:
		return jsonify({"error": str(e)}), 400

	if User.query.filter_by(email=data["email"]).first():
		return jsonify({"error": "Email already registered"}), 400

	user = User(
		name=data["name"],
		email=data["email"],
		community=data.get("community"),
	)
	user.password_hash = generate_password_hash(data["password"]) 
	db.session.add(user)
	db.session.commit()

	token = create_access_token(identity=str(user.id))
	return jsonify({
		"token": token,
		"user": {
			"id": str(user.id),
			"name": user.name,
			"email": user.email,
			"ecoCoins": user.eco_coins,
			"role": user.role,
		}
	}), 201


@auth_bp.post("/login")
def login():
	data = request.get_json() or {}
	try:
		require_fields(data, ["email", "password"])
	except ValueError as e:
		return jsonify({"error": str(e)}), 400

	user = User.query.filter_by(email=data["email"]).first()
	if not user or not check_password_hash(user.password_hash, data["password"]):
		return jsonify({"error": "Invalid credentials"}), 401

	token = create_access_token(identity=str(user.id))
	return jsonify({
		"token": token,
		"user": {
			"id": str(user.id),
			"name": user.name,
			"email": user.email,
			"ecoCoins": user.eco_coins,
			"role": user.role,
		}
	}), 200
