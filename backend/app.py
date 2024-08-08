from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = 'your_secret_key'

# Set up logging
logging.basicConfig(level=logging.INFO)

# Set up Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    """
    Loads the user from the database based on the user ID.

    Args:
        user_id (str): The ID of the user to load.

    Returns:
        User: The user object if found, otherwise None.
    """
    # Example user lookup, replace with actual database query
    return User.get(user_id)

class User(UserMixin):
    """
    User model class that represents a user in the application.
    Inherits from UserMixin to handle Flask-Login properties.
    """
    users = {
        "1": {"id": "1", "email": "test@example.com", "password": "password123"},
        # Add more users as needed
    }

    def __init__(self, id, email, password):
        self.id = id
        self.email = email
        self.password = password

    @classmethod
    def get(cls, user_id):
        """
        Class method to get a user by ID.

        Args:
            user_id (str): The ID of the user to retrieve.

        Returns:
            User: The user object if found, otherwise None.
        """
        user_data = cls.users.get(user_id)
        if user_data:
            return User(**user_data)
        return None

    def get_id(self):
        """
        Returns the ID of the user. Required by Flask-Login.

        Returns:
            str: The user's ID.
        """
        return self.id

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handles user login. If the request method is POST, it attempts to authenticate the user.
    If successful, the user is logged in and redirected to the protected route.

    Returns:
        response: Renders the login page on GET request or redirects on successful login.
    """
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        # Replace with actual user authentication logic
        user = User.get("1")  # Assuming a single test user
        if user and user.password == password:
            login_user(user)
            return redirect(url_for('protected_route'))
        else:
            flash('Login Unsuccessful. Please check your credentials and try again.')
    return render_template('login.html')

@app.route('/protected_route')
@login_required
def protected_route():
    """
    A route that requires user authentication. Only accessible to logged-in users.

    Returns:
        response: The content of the protected page.
    """
    return f"Hello, {current_user.email}! Welcome to the protected page."

@app.route('/logout')
@login_required
def logout():
    """
    Logs out the current user and redirects to the login page.

    Returns:
        response: A redirect to the login page.
    """
    logout_user()
    return redirect(url_for('login'))

@app.errorhandler(404)
def not_found(error):
    """
    Handles 404 errors (Page Not Found).

    Args:
        error: The error that triggered this handler.

    Returns:
        response: A JSON response with the error message and 404 status code.
    """
    app.logger.error(f'404 error: {error}, Route: {request.url}')
    return jsonify({'error': 'Not Found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """
    Handles 500 errors (Internal Server Error).

    Args:
        error: The error that triggered this handler.

    Returns:
        response: A JSON response with the error message and 500 status code.
    """
    app.logger.error(f'500 error: {error}, Route: {request.url}')
    return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == "__main__":
    app.run(debug=True)
