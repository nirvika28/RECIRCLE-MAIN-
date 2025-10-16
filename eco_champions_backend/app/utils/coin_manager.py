from typing import Optional
from ..database import db
from ..models import User, CoinTransaction


def update_user_role(user: User) -> None:
	if user.eco_coins < 10:
		user.role = "Eco Learner"
	elif 10 <= user.eco_coins < 30:
		user.role = "Eco Explorer"
	elif 30 <= user.eco_coins < 60:
		user.role = "Eco Champion"
	else:
		user.role = "Eco Enabler"


def award_coins(user_id, amount: int, reason: str) -> User:
	user: Optional[User] = User.query.get(user_id)
	if not user:
		raise ValueError("User not found")
	user.eco_coins = (user.eco_coins or 0) + int(amount)
	update_user_role(user)
	db.session.add(CoinTransaction(user_id=user.id, amount=int(amount), reason=reason))
	db.session.commit()
	return user
