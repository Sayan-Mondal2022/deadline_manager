from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/deadline")
def manage_deadline():
    return render_template("manage_deadline.html")

@app.route("/projects")
def manage_projects():
    return render_template("projects.html")

@app.route("/calendar")
def view_calendar():
    return render_template("calendar.html")

@app.route("/login")
def user_login():
    return render_template("login.html")

@app.route("/register")
def user_register():
    return render_template("register.html")

if __name__ == "__main__":
    app.run(debug=True)