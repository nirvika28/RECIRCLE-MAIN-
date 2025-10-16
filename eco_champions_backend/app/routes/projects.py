from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..database import db
from ..models import Project, ProjectParticipation, User
from ..utils.decorators import jwt_required_json
from ..utils.validators import require_fields
from ..utils.coin_manager import award_coins

projects_bp = Blueprint("projects", __name__)


@projects_bp.post("/create")
@jwt_required_json
def create_project():
	user_id = get_jwt_identity()
	data = request.get_json() or {}
	try:
		require_fields(data, ["title", "description", "goalMaterial", "goalWeight", "daysLeft"])
	except ValueError as e:
		return jsonify({"error": str(e)}), 400

	project = Project(
		title=data["title"],
		description=data["description"],
		goal_material=data["goalMaterial"],
		goal_weight=float(data["goalWeight"]),
		days_left=int(data["daysLeft"]),
		created_by=user_id,
	)
	db.session.add(project)
	db.session.commit()

	award_coins(user_id, 10, "Create Project")

	return jsonify({"id": str(project.id)}), 201


@projects_bp.get("")
@jwt_required_json
def list_projects():
	status = request.args.get("status")
	material = request.args.get("material")
	query = Project.query
	if status:
		query = query.filter_by(status=status)
	if material:
		query = query.filter_by(goal_material=material)
	items = query.order_by(Project.created_at.desc()).all()
	return jsonify([
		{
			"id": str(p.id),
			"title": p.title,
			"description": p.description,
			"goalMaterial": p.goal_material,
			"goalWeight": p.goal_weight,
			"collectedWeight": p.collected_weight,
			"status": p.status,
			"daysLeft": p.days_left,
			"createdBy": str(p.created_by) if p.created_by else None,
		}
		for p in items
	]), 200


@projects_bp.post("/participate/<project_id>")
@jwt_required_json
def participate(project_id):
	user_id = get_jwt_identity()
	data = request.get_json() or {}
	contrib = float(data.get("contributedWeight", 0))

	project = Project.query.get(project_id)
	if not project:
		return jsonify({"error": "Project not found"}), 404

	pp = ProjectParticipation(user_id=user_id, project_id=project.id, contributed_weight=contrib)
	db.session.add(pp)
	project.collected_weight = (project.collected_weight or 0) + contrib
	db.session.commit()

	# Participation rewards
	award_coins(user_id, 10, "Join Project")
	# Reward project creator 5 coins for each participation by others
	if project.created_by and str(project.created_by) != str(user_id):
		try:
			award_coins(project.created_by, 5, "Participant Joined Project")
		except Exception:
			pass

	# Completion check
	if project.collected_weight >= (project.goal_weight or 0) and project.status != "Completed":
		project.status = "Completed"
		db.session.commit()
		# reward all participants
		participants = ProjectParticipation.query.filter_by(project_id=project.id).all()
		for part in participants:
			try:
				award_coins(part.user_id, 20, "Complete Project")
			except Exception:
				pass

	return jsonify({"ok": True}), 200
