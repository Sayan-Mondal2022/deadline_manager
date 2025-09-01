from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = "4c1c340a729b21b363c4f96ab8683a95"  # for session handling
bcrypt = Bcrypt(app)

# ---------------- MongoDB ----------------
client = MongoClient("mongodb://localhost:27017/")
db = client["user_db"]
users = db["users"]
deadlines = db["deadlines"]

# ---------------- Context Processor ----------------
@app.context_processor
def inject_user():
    return dict(username=session.get("username"))

# ---------------- Home ----------------
# Update the home route in app.py
@app.route("/")
def home():
    if "username" not in session:
        return render_template("home.html")
    
    # Get user's deadlines
    user_deadlines = list(deadlines.find({"username": session["username"]}))
    
    # Calculate statistics
    total_projects = len(user_deadlines)
    completed_projects = len([d for d in user_deadlines if d.get("completed", False)])
    pending_projects = total_projects - completed_projects
    
    # Calculate overdue projects
    now = datetime.now()
    overdue_projects = len([d for d in user_deadlines 
                          if not d.get("completed", False) and d["due"] < now])
    
    # Get upcoming deadlines (next 7 days)
    next_week = datetime.now().replace(hour=23, minute=59, second=59) + timedelta(days=7)
    upcoming_deadlines = [d for d in user_deadlines 
                         if not d.get("completed", False) and d["due"] <= next_week and d["due"] >= now]
    
    # Sort by due date
    upcoming_deadlines.sort(key=lambda x: x["due"])
    
    # Limit to 5 upcoming deadlines
    upcoming_deadlines = upcoming_deadlines[:5]
    
    # Generate recent activity (this is a simplified example)
    recent_activity = [
        {"type": "completed", "message": "Completed 'Math Assignment'", "time": "2 hours ago"},
        {"type": "added", "message": "Added 'Science Project'", "time": "1 day ago"}
    ]
    
    return render_template(
        "home.html",
        total_projects=total_projects,
        completed_projects=completed_projects,
        pending_projects=pending_projects,
        overdue_projects=overdue_projects,
        upcoming_deadlines=upcoming_deadlines,
        recent_activity=recent_activity
    )

# ---------------- Deadlines ----------------
@app.route("/add_deadline", methods=["GET", "POST"])
def add_deadline():
    return manage_deadline()  # reuse the same function

@app.route("/deadline", methods=["GET", "POST"])
def manage_deadline():
    if "username" not in session:
        return redirect(url_for("user_login"))

    if request.method == "POST":
        deadline_data = {
            "username": session["username"],   # associate with logged-in user
            "type": request.form["type"],
            "title": request.form["title"],
            "due": datetime.strptime(request.form["due"], "%Y-%m-%dT%H:%M"),
            "notify_before": int(request.form["notify"]),
            "completed": False  # new field
        }
        deadlines.insert_one(deadline_data)
        flash("✅ Deadline added successfully!", "success")
        return redirect(url_for("manage_projects"))

    return render_template("add_deadline.html")

# ---------------- Projects ----------------
@app.route("/projects")
def manage_projects():
    if "username" not in session:
        return redirect(url_for("user_login"))

    user_deadlines = list(deadlines.find({"username": session["username"]}))
    
    # Split deadlines into due & completed
    due_projects = [d for d in user_deadlines if not d.get("completed", False)]
    completed_projects = [d for d in user_deadlines if d.get("completed", False)]

    return render_template(
        "projects.html",
        due_projects=due_projects,
        completed_projects=completed_projects
    )

@app.route("/projects/complete/<deadline_id>", methods=["POST"])
def mark_complete(deadline_id):
    """Mark a deadline as completed"""
    from bson.objectid import ObjectId
    deadlines.update_one({"_id": ObjectId(deadline_id)}, {"$set": {"completed": True}})
    flash("✅ Project marked as completed!", "success")
    return redirect(url_for("manage_projects"))

# ---------------- Calendar ----------------
@app.route("/calendar")
def view_calendar():
    if "username" not in session:
        return redirect(url_for("user_login"))

    user_deadlines = list(deadlines.find({"username": session["username"]}))
    
    # Pass deadlines to calendar (convert datetime to string for JS)
    calendar_events = [
        {
            "title": d["title"],
            "due": d["due"].strftime("%Y-%m-%d %H:%M"),
            "completed": d.get("completed", False),
            "type": d["type"]
        }
        for d in user_deadlines
    ]
    return render_template("calendar.html", events=calendar_events)

# ---------------- Authentication ----------------
@app.route("/login", methods=["GET", "POST"])
def user_login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = users.find_one({"username": username})
        if user and bcrypt.check_password_hash(user["password"], password):
            session["username"] = username
            flash("Login successful!", "success")
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password", "danger")
    
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def user_register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = bcrypt.generate_password_hash(request.form["password"]).decode("utf-8")

        if users.find_one({"username": username}):
            flash("Username already exists!", "warning")
            return redirect(url_for("user_register"))

        users.insert_one({
            "username": username,
            "email": email,
            "password": password
        })

        flash("Registration successful! Please login.", "success")
        return redirect(url_for("user_login"))
    
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop("username", None)
    flash("You have been logged out.", "info")
    return redirect(url_for("user_login"))

# ---------------- Run ----------------
if __name__ == "__main__":
    app.run(debug=True)
