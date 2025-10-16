import smtplib
from email.mime.text import MIMEText
from typing import Optional
from ..config import Config


def send_mail(to_email: str, subject: str, body: str) -> Optional[str]:
	"""Send a simple plaintext email using configured SMTP server.
	Returns None on success, or an error string on failure.
	"""
	server = Config.MAIL_SERVER
	port = Config.MAIL_PORT
	username = Config.MAIL_USERNAME
	password = Config.MAIL_PASSWORD
	use_tls = Config.MAIL_USE_TLS
	from_email = Config.MAIL_DEFAULT_SENDER or username

	if not (server and port and username and password and from_email):
		return "Mail server not configured"

	msg = MIMEText(body)
	msg["Subject"] = subject
	msg["From"] = from_email
	msg["To"] = to_email

	try:
		smtp = smtplib.SMTP(server, port)
		if use_tls:
			smtp.starttls()
		smtp.login(username, password)
		smtp.sendmail(from_email, [to_email], msg.as_string())
		smtp.quit()
		return None
	except Exception as e:
		return str(e)


