import sqlite3
from flask import Flask, g, jsonify
import os
import re
#from server import app
app = Flask(__name__)

DATABASE = os.path.join(os.path.dirname(__file__), 'database.db')

def init_db():
    """Runs the scripts in schema.sql"""
    db = get_db()
    with open('schema.sql', 'r') as sql_file:
        db.executescript(sql_file.read())
    db.commit()


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_db(error):
    """Automatic closedown after every request"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def find_user(email):
    query = """
            SELECT email, firstname, familyname, gender, city, country, password
            FROM user 
            WHERE email = ?
            """
    
    with get_db() as conn:
        conn.row_factory = sqlite3.Row  # Allows access to columns by name
        c = conn.cursor()
        c.execute(query, (email,))
        user = c.fetchone()
        
        if not user:
            return {"message": "No user with that email found.", "success": False}
        
        # Returning user data as a dictionary
        user_data = {key: user[key] for key in user.keys()}
        
        return {"user": user_data, "success": True}



def add_user(firstname, familyname, gender, city, country, email, password):
    try:
        conn = get_db()
        c = conn.cursor()

        query = """
                INSERT INTO user (firstname, familyname, gender, city, country, email, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """
        c.execute(query, (firstname, familyname, gender, city, country, email, password))
        conn.commit()

    except sqlite3.DatabaseError as e:
        return f"DatabaseError occurred: {e}"

    return True


def change_password_sql(newpassword, email):
    try:
        conn = get_db()
        c = conn.cursor()
        query = """
                UPDATE user
                SET password = ?
                WHERE email = ?
                """
        c.execute(query, (newpassword, email))
        conn.commit()
        if c.rowcount == 0:
            return False  # No rows were updated (email not found)
    except sqlite3.DatabaseError as e:
        return False
    return True


def is_correct_password(email, password):
    # Get the current password hash for the user
    conn = get_db()
    c = conn.cursor()
    query = """
            SELECT password
            FROM user
            WHERE email = ?
            """
    c.execute(query, (email,))
    current_password = c.fetchone()
    if current_password is None or current_password[0] != password:
        return False 
    return True


def add_token(email, token):
    try:
        conn = get_db()
        c = conn.cursor()
        query = """
                INSERT INTO loggeduser (email, token)
                VALUES (?, ?)
                """
        c.execute(query, (email, token))
        conn.commit()
    except sqlite3.DatabaseError as e:
        return f"DatabaseError occured: {e}"
    return True


def get_email_from_token(token):
    conn = get_db()
    c = conn.cursor()
    query = """
            SELECT email
            FROM loggeduser
            WHERE token = ?
            """
    c.execute(query, (token,))
    email = c.fetchone()
    if email:
        return email[0]
    return email


def post_message_sql(sender, receiver, message):
    conn = get_db()
    c = conn.cursor()
    query = """
            INSERT INTO message (receiver, sender, content)
            VALUES (?, ?, ?)
            """
    c.execute(query, (receiver, sender, message))
    conn.commit()
    if c.rowcount == 0:
            return False
    return True


def get_messages_by_token(token):
    email = get_email_from_token(token)
    conn = get_db()
    c = conn.cursor()
    query = """
            SELECT content, sender
            FROM message
            WHERE receiver = ?
            """
    c.execute(query, (email,))
    messages = c.fetchall()
    
    return messages


def get_messages_by_email(email):
    conn = get_db()
    c = conn.cursor()
    query = """
            SELECT content, sender
            FROM message
            WHERE receiver = ?
            """
    c.execute(query, (email,))
    messages = c.fetchall()
    return messages

def remove_logged_user(token):
    conn = get_db()
    c = conn.cursor()
    query = """
            DELETE FROM loggeduser
            WHERE token = ?
            """
    c.execute(query, (token,))
    conn.commit()
    if c.rowcount == 0:
        return False
    return True


def is_valid_email(email):
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) 


def is_valid_password(password):
    if len(password) < 8:
        return false
    return True

def wrong_token():
    return jsonify({"message": "Wrong token!", "success": False})