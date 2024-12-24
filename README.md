# Authentic Lebanese Sentiment Shop - Secure Ecommerce APP

Welcome to the **Authentic Lebanese Sentiment Shop**! This e-commerce platform is designed to celebrate Lebanese culture and heritage by offering a curated selection of traditional products and board games.

## Security Features:
The platform has been designed with a focus on **security**, leveraging various strategies to ensure the integrity, confidentiality, and availability of user and system data.

### Backend Security:

1. **Authentication and Authorization**:
   - **JWT Authentication**: The backend uses **JSON Web Tokens (JWT)** to authenticate users securely. Tokens are generated upon successful login and are required for accessing protected routes.
     - Tokens are signed with a secret key (`Config.SECRET_KEY`) to prevent tampering.
     - A custom `jwt_required` decorator is implemented to validate tokens and extract user information (e.g., `user_id` and `role`) for **role-based access control (RBAC)**.
   
   - **Role-Based Access Control (RBAC)**: 
     - Access to certain routes and actions is restricted based on user roles (e.g., Superadmin, Admin, User). This ensures that only authorized users can perform sensitive operations such as managing products, users, and orders.
     - These decorators are found in the `decorator.py` files in each service.

2. **CSRF Protection**:
   - **Cross-Site Request Forgery (CSRF)** protection is implemented to secure forms and API requests against malicious cross-origin attacks.
   - Every request includes a valid **CSRF token** to verify its legitimacy. 
   - CSRF tokens are required for POST, PUT, PATCH, and DELETE requests.

3. **Secure Data Handling**:
   - **SQL Injection Prevention**: All database queries are parameterized to prevent SQL injection attacks. The use of **SQLAlchemy ORM** models further enhances query security by abstracting raw SQL execution.
   - **Password Hashing**: User passwords are hashed using a secure algorithm (e.g., bcrypt) before being stored in the database to prevent unauthorized access in case of a data breach.

4. **Input Validation**:
   - Input data is rigorously validated at both the **client-side** and **server-side** to prevent injection attacks and ensure that inputs are correctly formatted.
   
5. **Activity Logging**:
   - All actions performed by admins are logged for accountability. This includes managing users, products, orders, and returns.

6. **Error Handling**:
   - Standardized error messages are implemented to avoid revealing sensitive details about database errors, which could aid in SQL injections.
   
7. **File Vulnerability Security**:
   - Only files with `.csv` extensions are allowed to be uploaded.
   - Files are verified for the correct MIME type and signature to ensure that only legitimate files are processed.
   - Uploaded files are stored temporarily and removed after validation.

8. **CORS Security**:
   - CORS policies are configured to restrict access to the API from unauthorized origins, primarily allowing frontend access only.

9. **Token Expiry**:
   - JWT tokens are set to expire after **1 hour**, after which the token automatically expires to reduce the risk of misuse.

10. **Rate Limiting**:
   - Rate limiting is implemented to restrict the number of requests a user can make. For example, the system is configured to allow up to 200 requests per day and 50 requests per hour for each user.

---

### Frontend Security:

1. **Input Validation**:
   - Each frontend function checks the validity of input parameters before making API requests to prevent malicious inputs like **SQL Injection** and **Cross-Site Scripting (XSS)**.

2. **Error Handling**:
   - Comprehensive **try-catch** blocks are used to handle errors gracefully and log them for debugging.

3. **No Exposed Errors**:
   - Errors are handled securely with generic messages to avoid revealing sensitive information.

4. **HTTP Secure Headers**:
   - Secure headers, including those for cookies and tokens, are centrally managed in `api.js`.

5. **Secure API Headers**:
   - Secure headers, such as **Authorization tokens**, are applied consistently across all requests via a central API service.

6. **Logging and Monitoring**:
   - Errors are logged using `console.error` to provide developers with runtime insights.

7. **Session Expiry**:
   - Tokens have a limited lifespan. If a session token expires, the user will be prompted to log in again.

8. **Disable Unnecessary Features**:
   - Functions explicitly limit data returned by APIs to what is necessary, reducing the exposure of potential attack vectors.

9. **SameSite Cookies**:
   - Tokens like **JWT** and **CSRF tokens** are stored in cookies with the **SameSite** attribute to protect against **CSRF** attacks.

10. **XSS Mitigation**:
    - Input fields, such as the **reason field**, are sanitized to remove potential **HTML tags**, thus mitigating the risk of **Cross-Site Scripting (XSS)**.

11. **Secure Routing**:
    - Navigation is managed using `useNavigate`, preventing unsafe URL manipulations.

12. **Length Restrictions on Input Fields**:
    - Input fields, such as **user_id** and **reason**, have character length restrictions to prevent buffer overflow attacks.

13. **Tooltip Guidance for Restricted Actions**:
    - Tooltips provide guidance for users regarding actions like **item returns**, minimizing misuse.

14. **Encoded URLs**:
    - URLs are encoded using `encodeURIComponent` to prevent URL injection or manipulation.

15. **Secure Data Handling**:
    - All data, such as **orderData** and **updateData**, are validated for type and structure before being sent to the server.

---

This platform has been designed with **security first** to ensure that both admins and users have a safe, reliable, and seamless experience. By leveraging cutting-edge security measures like JWT, CSRF protection, RBAC, and more, we are committed to maintaining the integrity of your data and protecting against common security threats.
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


