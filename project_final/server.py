from __init__ import create_app
from database_helper import *
from flask import Flask, request, jsonify, current_app
import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import secrets
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)

active_sessions = {}

@sock.route('/echo')
def echo(ws):
    token = ws.receive() 
    email = get_email_from_token(token)

    active_sessions[email] = ws

    try:
        while True:
            data = ws.receive()
            ws.send(data)
    except Exception as e:
        print(f"Error: {e}")


@app.route('/')
def home():
    return current_app.send_static_file('client.html')


@app.route('/sign_in', methods=['POST'])
def sign_in():
    try:
        email = request.json.get("username")
        password = request.json.get("password")

        if not (isinstance(email, str) and isinstance(password, str)):
            return jsonify({"message": "Invalid input"}), 400


        user = find_user(email)
        if not user:
            return jsonify({"message": "User not found"}), 404

        user_data = user

        if user_data["password"] != password:
            return jsonify({"message": "Wrong password"}), 401

        old_session = active_sessions.pop(email, 0);
        if old_session:
            old_session.send("You have been logged out due to login from another browser.")

        token = secrets.token_hex(40)

        s = add_token(email, token)
        return jsonify({"message": "Successfully logged in", "data": token}), 200
    except:
        return jsonify({"message": "Internal error"}), 500

@app.route('/sign_up', methods=['POST'])
def sign_up():
    try:
        firstname = request.json.get("firstname")
        familyname = request.json.get("familyname")
        gender = request.json.get("gender")
        city = request.json.get("city")
        country = request.json.get("country")
        email = request.json.get("email")
        password = request.json.get("password")

        if not (isinstance(firstname, str) and isinstance(familyname, str) and isinstance(gender, str) and isinstance(city, str) and isinstance(country, str) and isinstance(email, str) and isinstance(password, str)):
            return jsonify({"message": "Invalid input"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email"}), 400

        if find_user(email):
            return jsonify({"message": "Email taken"}), 409

        added_success = add_user(firstname, familyname, gender, city, country, email, password)
        if added_success:
            return jsonify({"message": "User added successfully"}), 201
    except:
        return jsonify({"message": "Internal Error"}), 500


@app.route('/change_password', methods=['PUT'])
def change_password():
    try:
        token = request.headers.get("Authorization")
    
        oldpassword = request.json.get("oldpassword")
        newpassword = request.json.get("newpassword")
    
        email = get_email_from_token(token)
        if not email:
            return jsonify({"message": "Wrong token"}), 401
    
        if not isinstance(oldpassword, str) or not isinstance(newpassword, str):
            return jsonify({"message": "Invalid input"}), 400
    
        if newpassword == oldpassword:
            return jsonify({"message": "Same password"}), 400
    
        if not is_correct_password(email, oldpassword):
            return jsonify({"message": "Incorrect old password"}), 401
    
        change_success = change_password_sql(newpassword, email)
        if change_success:
            return jsonify({"message": "Password changed"}), 200
    except:
        return jsonify({"message": "Internal Error"}), 500

@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    try:   
        token = request.headers.get("Authorization")
        email = get_email_from_token(token)
        if not email:
            return jsonify({"message": "Wrong token"}), 401

        user = find_user(email)
        if user:
            return jsonify({"message": "Data retrived", "data": user}), 200
    except:
        return jsonify({"message": "Internal Error"}), 500


@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    try:
        token = request.headers.get("Authorization")
        my_email = get_email_from_token(token)
        if not my_email:
            return jsonify({"message": "Wrong token"}), 401

        user = find_user(email)
        if user:
            return jsonify({"message": "Data retrived", "data": user}), 200
        else:
            return jsonify({"message": "User not found"}), 404
    except:
        return jsonify({"message": "Internal Error"}), 500


@app.route('/post_message', methods=['POST'])
def post_message():
    try:
        token = request.headers.get("Authorization")
        message = request.json.get("message")
        email = request.json.get("email")

        my_email = get_email_from_token(token)
        if not my_email:
            return jsonify({"message": "Wrong token"}), 401
        if not isinstance(message, str) or not isinstance(email, str):
            return jsonify({"message": "Invalid input"}), 400
        
        user = find_user(email)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        post_message_sql(my_email, email, message)
        return jsonify({"message": "Successfully posted a message"}), 201
    except:
        return jsonify({"message": "Internal Error"}), 500


@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    try: 
        token = request.headers.get("Authorization")
        my_email = get_email_from_token(token)
        if not my_email:
            return jsonify({"message": "Wrong token"}), 401
            
        messages = get_messages_by_token(token)
        return jsonify({"message": "Messages retrived successfully", "data": messages}), 200
    except:
        return jsonify({"message": "Internal Error"}), 500

@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    try:
        
        token = request.headers.get("Authorization")
        my_email = get_email_from_token(token)
        if not my_email:
            return jsonify({"message": "Wrong token"}), 401

        if not find_user(email):
            return jsonify({"message": "User not found"}), 404
        messages = get_messages_by_email(email)
        return jsonify({"message": "Messages retrived successfully", "data": messages}), 200
    except:
        return jsonify({"message": "Internal Error"}), 500

@app.route('/sign_out/<forced>', methods=['DELETE'])
def sign_out(forced):
    try:
        token = request.headers.get("Authorization")
        my_email = get_email_from_token(token)
        if not my_email:
            return jsonify({"message": "Wrong token"}), 401

        remove_logged_user(token)
        if (forced == '1'):
            return jsonify({"message": "Forced logout"}), 200
        return jsonify({"message": "Successfully logged out"}), 200
    except:
        return jsonify({"message": "Internal Error"}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
