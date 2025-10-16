from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..models import User
from ..utils.decorators import jwt_required_json
from ..utils.geo import haversine_km, kmeans_once


community_bp = Blueprint("community", __name__)


@community_bp.post("/location")
@jwt_required_json
def save_location():
	data = request.get_json() or {}
	lat = data.get("latitude")
	lon = data.get("longitude")
	if lat is None or lon is None:
		return jsonify({"error": "latitude and longitude required"}), 400
	user = User.query.get(get_jwt_identity())
	if not user:
		return jsonify({"error": "User not found"}), 404
	try:
		user.latitude = float(lat)
		user.longitude = float(lon)
		db.session.commit()
		return jsonify({"ok": True}), 200
	except Exception:
		return jsonify({"error": "Failed to save location"}), 500


@community_bp.get("/clusters")
@jwt_required_json
def clusters():
	"""Cluster users based on lat/lon; returns clusters for the caller's area.
	Optional query params: k (default 3), radiusKm (filter cluster neighbors by distance)
	"""
	current = User.query.get(get_jwt_identity())
	if not current or current.latitude is None or current.longitude is None:
		return jsonify({"error": "Current user location not set"}), 400
	users = User.query.filter(User.latitude.isnot(None), User.longitude.isnot(None)).all()
	points = [(u.latitude, u.longitude) for u in users]
	k = int(request.args.get("k", 3))
	clusters = kmeans_once(points, k)
	# find which cluster current user belongs to (closest centroid heuristic)
	# simple approach: choose cluster that contains current user's index if exact match; else nearest by distance
	try:
		me_index = users.index(current)
		for ci, cluster in enumerate(clusters):
			if me_index in cluster:
				my_cluster = ci
				break
		except ValueError:
		my_cluster = 0

	result = []
	radius = float(request.args.get("radiusKm", 0))
	for idx in clusters[my_cluster]:
		u = users[idx]
		dist = haversine_km(current.latitude, current.longitude, u.latitude, u.longitude)
		if radius and dist > radius:
			continue
		result.append({
			"id": str(u.id),
			"name": u.name,
			"latitude": u.latitude,
			"longitude": u.longitude,
			"distanceKm": round(dist, 2),
		})
	return jsonify({"cluster": result}), 200


