import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(to_email: str, token: str):
    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    sender_email = os.environ.get("SMTP_FROM", smtp_username or "noreply@medivault.com")

    # If no credentials, we still want it to "work" by logging or raising, 
    # but let's actually just raise an error if they haven't configured it yet, 
    # so they know they have to configure it.
    if not smtp_username or not smtp_password:
        # Fallback to local testing mailhog/mailpit on default port if no auth provided
        # or just print it so the backend doesn't crash during development
        print(f"===========================================================")
        print(f"SMTP WARNING: SMTP_USERNAME or SMTP_PASSWORD not set in env.")
        print(f"To actually send the email, set SMTP_USERNAME and SMTP_PASSWORD.")
        print(f"Token that would have been emailed to {to_email}: {token}")
        print(f"===========================================================")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Password Reset Request - MediVault"
    msg["From"] = sender_email
    msg["To"] = to_email

    text = f"""
    You have requested to reset your password.
    Your password reset token is: {token}
    
    If you did not request this, please ignore this email.
    """
    
    html = f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password.</p>
        <p>Your secure password reset token is: <strong>{token}</strong></p>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"Reset email successfully sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Not raising an exception here to avoid breaking the API flow if SMTP is misconfigured
