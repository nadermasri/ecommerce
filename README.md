# Authentic Lebanese Sentiment Shop

Welcome to the **Authentic Lebanese Sentiment Shop**! This e-commerce platform is designed to celebrate Lebanese culture and heritage by offering a curated selection of traditional products and board games.

Currently, the project includes only the **Admin module**.

---

## Tech Stack

### **Backend**
- **Framework**: Flask
- **Database**: SQLAlchemy (MySQL)
- **Authentication**: JWT with CSRF protection
- **APIs**: RESTful APIs tested with Postman
- Runs on `localhost:5000`

### **Frontend**
- **Technologies**: React
- **Dashboard**: Includes user-friendly admin and user interfaces
- Runs on `localhost:3000`

---

## Installation

### **Clone the Repository**
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce.git
   cd ecommerce

### **Setup the Backend**
Set up a virtual environment:

On macOS/Linux:
bash
Copy code
python -m venv venv
source venv/bin/activate
On Windows:
bash
Copy code
python -m venv venv
venv\Scripts\activate

### **Install dependencies:**

bash
Copy code
pip install -r requirements.txt

Configure the .env file: Create a .env file in the root directory and add the following:

plaintext
Copy code
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=mysql://username:password@localhost/ecommerce_db

### **Initialize the database:**

bash
Copy code
flask db init
flask db migrate
flask db upgrade

### **Run the development server:**

bash
Copy code
flask run
Setup the Frontend
Navigate to the frontend directory:

bash
Copy code
cd frontend

Install dependencies:

bash
Copy code
npm install
Start the frontend development server:

bash
Copy code
npm start

### **Notes**
Backend: Runs on localhost:5000
Frontend: Runs on localhost:3000
The frontend connects to the backend through RESTful API endpoints.

### **Contributors**
Yasmeen Lamaa - Developer
Nader Al Masri - Developer
Lynn El Hariri - Developer


