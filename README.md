# DEADLINE MANAGER

The **Deadline Manager** is a powerful and user-friendly web application designed to help individuals and teams efficiently track tasks, manage project deadlines, and stay organized. It ensures that no deadline is missed and all tasks are visible, prioritized, and manageable from a central dashboard.

---

## 🖥️ User Interface Overview

### 📊 Dashboard View
<img width="1874" height="914" alt="image" src="https://github.com/user-attachments/assets/a732336b-e5d7-4789-93f6-7ba9052e4386" />

### 📌 Task Management
<img width="748" height="926" alt="image" src="https://github.com/user-attachments/assets/6780c32b-cc8d-462e-8c87-f26f9b35d187" />

### 📂 Task Overview
<img width="1914" height="978" alt="image" src="https://github.com/user-attachments/assets/0d7b3ebf-17ed-48e9-864b-11b7f7cca2e3" />

### 📅 Calendar View
<img width="1915" height="982" alt="image" src="https://github.com/user-attachments/assets/370be46f-a3f8-4ce5-8e6e-18894e1c7188" />


---

## 🚀 Features

### 📌 Task Management
- Add new tasks (projects) with the following details:
  - **Task Name** – A clear title for your task.
  - **Task Deadline** – Specify a due date and time.
  - **Description** – Provide additional details about the task.
  - **Notify Period** – Set a reminder period before the deadline.

### 📂 Task Overview
- View all your tasks and deadlines on a single page.
- Perform quick actions on tasks:
  - **Mark as Completed** – Update task status when finished.
  - **Delete Task** – Remove tasks that are no longer needed.
  - **View Details** – Review complete task information.

### 📅 Calendar View
- Display all tasks visually in a calendar format.
- Easily track deadlines based on dates.

### 📊 Dashboard
- Get a summarized view of all tasks:
  - **Completed Tasks** – Tasks that have been successfully finished.
  - **Due Tasks** – Pending tasks approaching their deadlines.
  - **Overdue Tasks** – Tasks that have passed their deadline.

---

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Flask
- **Database:** MongoDB 
- **Notifications:** Twilio API for WhatsApp notification

---

## 🗂 Project Structure

```bash
deadline_manager/
├── static/
│   └── css/
│   └── images/
│   └── js/
├── templates/
├── .gitignore
├── README.md
├── app.py
└── requirements.txt
```

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

## 🙏 Acknowledgement  

I would like to acknowledge and express my gratitude to the open-source community and the developers behind the technologies that made this project possible.  

- **Flask** – for providing a lightweight and powerful web framework.  
- **MongoDB** – for its flexible NoSQL database solution.  
- **JavaScript, HTML, and CSS** – for enabling the creation of an interactive and responsive user interface.  
- **Python** – for being the backbone of the application’s logic and functionality.  
- **Twilio API** – for enabling reliable SMS notifications and communication features.  

This project, **Deadline Manager**, was built by combining these tools to deliver an efficient platform for managing deadlines effectively.  

