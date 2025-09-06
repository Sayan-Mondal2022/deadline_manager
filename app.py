import os
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException # Import the exception
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = "4c1c340a729b21b363c4f96ab8683a95"
print(app.secret_key)
bcrypt = Bcrypt(app)

# ---------------- MongoDB ----------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["user_db"]
users = db["users"]
deadlines = db["deadlines"]

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")  # your Twilio number

client_twilio = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# MODIFIED for debugging
def send_sms(to, body):
    """Sends an SMS and prints detailed logs."""
    try:
        # DEBUGGING: Print what is being attempted
        # print(f"  ➡️  Attempting to send SMS to: {to}")
        # print(f"      Message Body: '{body}'")
        
        message = client_twilio.messages.create(
            body=body,
            from_=f"whatsapp:{TWILIO_PHONE}",
            to=f"whatsapp:{to}",
        )
        # DEBUGGING: Print on success
        print(f"  ✅  SMS sent successfully! SID: {message.sid}")
        
    except TwilioRestException as e:
        # DEBUGGING: Print specific Twilio errors
        print(f"  ❌  Twilio Error: Failed to send SMS to {to}.")
        print(f"      Error Code: {e.code}")
        print(f"      Error Message: {e.msg}")
    except Exception as e:
        # DEBUGGING: Print any other unexpected errors
        print(f"  ❌  An unexpected error occurred during SMS sending: {e}")

# MODIFIED for debugging
def check_and_notify():
    """Checks for upcoming deadlines and prints a detailed execution log."""
    now = datetime.now()
    # DEBUGGING: Announce that the job is running
    # print(f"\n--- Scheduler Job Running at {now.strftime('%Y-%m-%d %H:%M:%S')} ---")
    
    all_deadlines = list(deadlines.find({"completed": False}))
    
    # DEBUGGING: Report how many deadlines are being checked
    if not all_deadlines:
        print("🔍 No pending deadlines found to check.")
        return
    else:
        print(f"🔍 Found {len(all_deadlines)} pending deadlines. Checking each...")

    for d in all_deadlines:
        due = d["due"]
        notify_before = d.get("notify_before", 0)
        notify_time = due - timedelta(hours=notify_before)
        # notify_time = due - timedelta(minutes=notify_before)
        
        # DEBUGGING: Print details for each deadline being checked
        # print(f"\n  Checking '{d['title']}' for user '{d['username']}':")
        # print(f"    - Current Time:   {now.strftime('%Y-%m-%d %H:%M:%S')}")
        # print(f"    - Due Time:       {due.strftime('%Y-%m-%d %H:%M:%S')}")
        # print(f"    - Notify Time:    {notify_time.strftime('%Y-%m-%d %H:%M:%S')}")

        # The core condition to trigger a notification
        if notify_time <= now < due:
            # DEBUGGING: Announce that the condition was met
            print("    - 🎯 CONDITION MET! Preparing to send notification.")
            
            user = users.find_one({"username": d["username"]})
            if user and user.get("number"):
                # DEBUGGING: Confirm user and number were found
                print(f"    - User '{user['username']}' found with number '{user['number']}'.")
                body = f"Reminder: Your project '{d['title']}' is due at {due.strftime('%Y-%m-%d %H:%M')}."
                send_sms(user["number"], body)
            else:
                # DEBUGGING: Report why SMS was not sent
                if not user:
                    print(f"    - ⚠️  User '{d['username']}' not found in the database.")
                else:
                    print(f"    - ⚠️  User '{d['username']}' found, but has no phone number.")
        else:
            # DEBUGGING: Announce that the condition was NOT met
            print("    - ⏳ Condition not met. No notification sent.")

scheduler = BackgroundScheduler()
scheduler.add_job(func=check_and_notify, trigger="interval", minutes=1)
scheduler.start()

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

@app.route("/projects/delete/<deadline_id>", methods=["POST"])
def delete_deadline(deadline_id):
    """Delete a deadline"""
    from bson.objectid import ObjectId
    deadlines.delete_one({"_id": ObjectId(deadline_id)})
    flash("🗑️ Project deleted successfully!", "info")
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
        number = request.form["number"]
        password = bcrypt.generate_password_hash(request.form["password"]).decode("utf-8")

        if users.find_one({"username": username}):
            flash("Username already exists!", "warning")
            return redirect(url_for("user_register"))

        users.insert_one({
            "username": username,
            "email": email,
            "number": number,
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
