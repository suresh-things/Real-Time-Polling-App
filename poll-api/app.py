import os
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv # For local development

load_dotenv() # Load environment variables from .env file for local dev

app = Flask(__name__)
# Allow CORS for requests from any origin (adjust in production!)
CORS(app)

# --- Database Configuration ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "poll_db")
DB_USER = os.getenv("DB_USER", "poll_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "poll_password")

# --- Poll Options (Hardcoded for simplicity) ---
# In a more complex app, these could come from the database
POLL_OPTIONS = [
    {"id": "python", "name": "Python"},
    {"id": "go", "name": "Go"},
    {"id": "rust", "name": "Rust"},
    {"id": "javascript", "name": "JavaScript"},
]

# --- Database Connection Helper ---
def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to database: {e}")
        return None

# --- API Routes ---

@app.route('/options', methods=['GET'])
def get_options():
    """Returns the list of available poll options."""
    return jsonify(POLL_OPTIONS)

@app.route('/vote/<option_id>', methods=['POST'])
def cast_vote(option_id):
    """Increments the vote count for a given option."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    # Check if the voted option is valid
    valid_option = any(opt['id'] == option_id for opt in POLL_OPTIONS)
    if not valid_option:
         return jsonify({"error": "Invalid option ID"}), 400

    try:
        with conn.cursor() as cur:
            # Use INSERT ... ON CONFLICT to handle new options or existing ones
            # This ensures atomicity and avoids race conditions compared to SELECT then UPDATE/INSERT
            sql = """
                INSERT INTO votes (option_id, vote_count)
                VALUES (%s, 1)
                ON CONFLICT (option_id)
                DO UPDATE SET vote_count = votes.vote_count + 1;
            """
            cur.execute(sql, (option_id,))
            conn.commit()
        return jsonify({"success": True, "message": f"Vote cast for {option_id}"})
    except psycopg2.Error as e:
        conn.rollback() # Rollback in case of error
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to record vote"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/results', methods=['GET'])
def get_results():
    """Returns the current vote counts for all options."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    results = {}
     # Initialize results with 0 for all defined options
    for option in POLL_OPTIONS:
        results[option['id']] = {"name": option['name'], "votes": 0}

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT option_id, vote_count FROM votes;")
            db_rows = cur.fetchall()
            # Update results with counts from the database
            for row in db_rows:
                option_id, vote_count = row
                if option_id in results: # Only update if it's a known option
                     results[option_id]["votes"] = vote_count
        # Convert the dictionary back to a list format expected by frontend
        results_list = [{"id": k, "name": v["name"], "votes": v["votes"]} for k, v in results.items()]
        return jsonify(results_list)
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to fetch results"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/healthz', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    # Optionally add a DB connection check here
    return jsonify({"status": "ok"})

# --- Run Application ---
if __name__ == '__main__':
    # Use Flask's development server for local testing (python app.py)
    # In production (container), Gunicorn will run the app
    app.run(host='0.0.0.0', port=5000, debug=True) # Debug=True for dev only!