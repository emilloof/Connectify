from __init__ import create_app
from database_helper import *
from flask import Flask, request, jsonify, current_app
import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import secrets
from flask_sock import Sock

#app = create_app()
app = Flask(__name__)
sock = Sock(app)

active_sessions = {}
active_token = {}

#RETURN True OR "true" IDKK

@sock.route('/echo')
def echo(ws):
    token = ws.receive() 
    user_id = get_email_from_token(token)
    print("token: " + token)
    if (user_id in active_token):
        print("active_token: " + active_token[user_id])
    else:
        print("active_token: none")
    if (user_id in active_token and token != active_token[user_id]) and user_id in active_sessions:
        existing_ws = active_sessions[user_id]
        existing_ws.send("You have been logged out due to login from another browser.")
        existing_ws.close()

    active_sessions[user_id] = ws
    active_token[user_id] = token

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
    email = request.json.get("username")
    password = request.json.get("password")

    user = find_user(email)
    if not user["success"]:
        return jsonify(user)

    user_data = user["user"]

    if user_data["password"] != password:
        return jsonify({"message": "Wrong username or password"}), 400

    token = secrets.token_hex(40)

    s = add_token(email, token)

    return jsonify({"message": "Successfully logged in", "data": token}), 200


@app.route('/sign_up', methods=['POST'])
def sign_up():
    firstname = request.json.get("firstname")
    familyname = request.json.get("familyname")
    gender = request.json.get("gender")
    city = request.json.get("city")
    country = request.json.get("country")
    email = request.json.get("email")
    password = request.json.get("password")

    if not (firstname and familyname and gender and city and country and email and password): #can use isinstance(str)
        return jsonify({"message": "invalid input", "success": False})

    if not is_valid_email(email):
        return jsonify({"message": "Not a valid email", "success": False})

    #valid password

    if find_user(email)["success"]:
        return jsonify({"message": "There already excist a user with that email", "success": False})
    
    added_success = add_user(firstname, familyname, gender, city, country, email, password)
    if added_success:
        return jsonify({"message": "User added successfully", "success": True})
    return jsonify({"message": "Something went wrong", "success": False})


@app.route('/change_password', methods=['PUT'])
def change_password():
    token = request.headers.get("Authorization")

    oldpassword = request.json.get("oldpassword")
    newpassword = request.json.get("newpassword")

    email = get_email_from_token(token)
    if not email:
        return wrong_token()

    if not isinstance(oldpassword, str) or not isinstance(newpassword, str):
        return jsonify(message="IDK", success=False)

    if newpassword == oldpassword:
        return jsonify({"message": "You cant change to your old password", "success": False})

    if not is_valid_password(newpassword):
        return jsonify({"message": "Use a valid password", "success": False})

    if not is_correct_password(email, oldpassword):
        return jsonify({"message": "Incorrect old password", "success": False})

    change_success = change_password_sql(newpassword, email)
    if change_success:
        return jsonify({"message": "Password changed", "success": True})
    return jsonify({"message": "Something went wrong", "success": False})


@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get("Authorization")
    email = get_email_from_token(token)
    if not email:
        return wrong_token()
    user = find_user(email)
    return user


@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get("Authorization")

    my_email = get_email_from_token(token)
    if not my_email:
        return wrong_token()

    user = find_user(email)
    return user


@app.route('/post_message', methods=['POST'])
def post_message():
    token = request.headers.get("Authorization")
    message = request.json.get("message")
    email = request.json.get("email")

    if not isinstance(message, str) or not isinstance(email, str):
        return jsonify({"message": "Wrong input", "success": False})

    user = find_user(email)
    if not user["success"]:
        return user

    my_email = get_email_from_token(token)
    if not my_email:
        return wrong_token()

    success = post_message_sql(my_email, email, message)
    if not success:
        return jsonify({"message": "Sum went wrong ngl", "success": False})
    return jsonify({"message": "Successfully posted a message", "success": True})


@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get("Authorization")
    #verify_token(token)
    messages = get_messages_by_token(token)
    if not messages:
        return jsonify({"message": "TODO", "success": False})
    return jsonify({"message": "Here are your messages", "success": True, "data": messages})


@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get("Authorization")
    my_email = get_email_from_token(token)
    if not my_email:
        return wrong_token()

    messages = get_messages_by_email(email)
    if not messages:
        return jsonify({"message": "", "success": False})
    return jsonify({"message": "Here are your messages", "success": True, "data": messages})


@app.route('/sign_out', methods=['DELETE'])
def sign_out():
    token = request.headers.get("Authorization")
    my_email = get_email_from_token(token)
    if not my_email:
        return wrong_token()

    logged_out = remove_logged_user(token)

    if not logged_out:
        return jsonify({"message": "Something went wrong", "success": False})
    existing_ws = active_sessions[my_email]
    existing_ws.close()
    active_token.pop(my_email)
    active_sessions.pop(my_email)
    return jsonify({"message": "Successfully logged out", "success": True})

@app.route('/forced_sign_out', methods=['DELETE'])
def forced_sign_out():
    token = request.headers.get("Authorization")
    my_email = get_email_from_token(token)
    if not my_email:
        return wrong_token()

    logged_out = remove_logged_user(token)

    if not logged_out:
        return jsonify({"message": "Something went wrong", "success": False})
    return jsonify({"message": "Another session opened!", "success": True})


if __name__ == "__main__":
  #  with app.app_context():
   #     init_db()
    app.run(host='0.0.0.0', port=5000)
