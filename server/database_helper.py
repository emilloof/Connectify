import sqlite3
from flask import Flask, g, jsonify
import os
from server import app


"""


THE RETURN VALUES OF THE FUNCTIONS ARE NOT DONE YET.
IM NOT SURE WHAT WE WANT TO RETURN


"""


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

def test():
    """TEST FUNCTION - IGNORE"""
    t = ("RHAT",)
    c = get_db().cursor()
    c.execute("SELECT * FROM user where firstname = 'emil'")
    result = c.fetchall()
    print(result)
    # Convert result into a list of dictionaries for easy rendering
    return jsonify(result)  # Respond with JSON


def find_user(email):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM user WHERE email =?", (email,))
    user = c.fetchall()
    if not user:
        return {"message": "No user with that email found.", "success": False}
    return {"user": user, "success": True}


def add_user(firstname, familyname, gender, city, country, email, password):
    try:
        conn = get_db()
        c = conn.cursor()

        sql = """
                INSERT INTO user (firstname, familyname, gender, city, country, email, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              """
        c.execute(sql, (firstname, familyname, gender, city, country, email, password))
        conn.commit()

    except sqlite3.DatabaseError as e:
        return f"DatabaseError occurred: {e}"
