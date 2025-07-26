from flask import Flask, render_template, request, url_for, redirect

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

@app.route("/login", methods=["GET", "POST"])
def user_login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        # You should validate credentials here (mock check or database)
        if username and password:  # Temporary check
            return redirect(url_for("home"))
    
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def user_register():
    user_info = {
        'username': None,
        "email": None,
        "password": None,
    }
    if request.method == "POST":
        user_info['username'] = request.form["username"]
        user_info['email'] = request.form["email"]
        user_info['password'] = request.form["password"]

    if all(user_info.values()):
        print("User Registration successful!!")
        print("User information: ",user_info)
        return redirect(url_for("user_login"))
    
    return render_template("register.html")

if __name__ == "__main__":
    app.run(debug=True)