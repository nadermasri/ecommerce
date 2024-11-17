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

### Setup the Backend

1. **Set up a virtual environment**:

   - On macOS/Linux:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```

   - On Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt

3. **Configure the .env file: Create a .env file in the root directory and add the following**:
   ```bash
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your_secret_key
   DATABASE_URL=mysql://username:password@localhost/ecommerce_db

4. **Initialize the database**:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade

5. **Run the development server**:
   ```bash
   flask run

### Setup the Frontend
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend

2. **Install dependencies:**
   ```bash
   npm install

3. **Start the frontend development server:**
   ```bash
   npm start

---

### Notes
- **Backend**: Runs on localhost:5000
- **Frontend**: Runs on localhost:3000
- The frontend connects to the backend through RESTful API endpoints.

---

### Contributors
- Yasmeen Lamaa
- Nader Al Masri
- Lynn El Hariri


