# DEADLINE MANAGER

The **Deadline Manager** is a powerful and user-friendly web application designed to help individuals and teams efficiently track tasks, manage project deadlines, and stay organized. It ensures that no deadline is missed and all tasks are visible, prioritized, and manageable from a central dashboard.

---

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Flask
- **Database:** MongoDB 
- **Notifications:** Twilio API for WhatsApp notification

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Sayan-Mondal2022/deadline_manager.git
cd deadline_manager
```

### 2. Create and Activate a Virtual Environment

```bash
py -m venv .venv

# For windows using Git Bash
source .venv\Scripts\activate

# For Linux\Mac OS
source .venv/bin/activate
```

### 3. Install the Dependencies

 ```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file

```bash
SECRET_KEY='SECRET_KEY'   # Add a secret key for Flask Sessions
MONGO_URI="mongodb://localhost:27017/"

# Twilio API Setup
TWILIO_ACCOUNT_SID='TWILIO_ACCOUNT_SID'
TWILIO_AUTH_TOKEN='TWILIO_AUTH_TOKEN'
TWILIO_PHONE='TWILIO_PHONE'
```

### 5. Create a Twilio Account and Initialize the WhatsApp virtual sandbox

### 6. Run the Flask App

```bash
python app.py
```

---

## 📌 Acknowledgement  

I would like to acknowledge and express my gratitude to the open-source community and the developers behind the technologies that made this project possible.  

- **Flask** – for providing a lightweight and powerful web framework.  
- **MongoDB** – for its flexible NoSQL database solution.  
- **JavaScript, HTML, and CSS** – for enabling the creation of an interactive and responsive user interface.  
- **Python** – for being the backbone of the application’s logic and functionality.  
- **Twilio API** – for enabling reliable SMS notifications and communication features.  

This project, **Deadline Manager**, was built by combining these tools to deliver an efficient platform for managing deadlines effectively.  

