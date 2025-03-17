from flask import Flask, request, jsonify
from flask_mail import Mail, Message
import random
import os

app = Flask(__name__)

# Configure Flask-Mail for sending emails
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL')  # Use environment variable for security
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')  # Use environment variable for security
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL')

mail = Mail(app)

# Store OTPs temporarily (use a database in production)
otp_store = {}

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp  # Store OTP temporarily

    # Send OTP via email
    try:
        msg = Message("Your OTP Code", recipients=[email])
        msg.body = f"Your OTP for verification is: {otp}"
        mail.send(msg)
        return jsonify({"success": True, "message": "OTP sent successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    if otp_store.get(email) == otp:
        del otp_store[email]  # Remove OTP after successful verification
        return jsonify({"success": True, "message": "OTP verified successfully"})
    else:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400

if __name__ == '__main__':
    app.run(debug=True)
