from __init__ import create_app
from database_helper import *
from flask import Flask, request, jsonify

app = create_app()


"""

ONLY SIGN_UP IS SOMEWHAT FINISHED, IGNORE THE REST


"""

@app.route('/')
def testa():
    y = find_user("john.doe@example.com")
    if y["success"]:
        return jsonify(y["user"])
    return y

@app.route('/sign_in', methods=['POST'])
def sign_in():
    email = request.json.get("email")
    password = request.json.get("password")

    print(find_user(email))
    return "da"


@app.route('/sign_up', methods=['POST'])
def sign_up():
    firstname = request.json.get("firstname")
    familyname = request.json.get("familyname")
    gender = request.json.get("gender")
    city = request.json.get("city")
    country = request.json.get("country")
    email = request.json.get("email")
    password = request.json.get("password")  

    if find_user(email)["success"]:
        return jsonify({"message": "There already excist a user with that email"}), 400
    
    return add_user(firstname, familyname, gender, city, country, email, password)




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8084)
    init_db()