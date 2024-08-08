from flask import Flask, jsonify, request, redirect, url_for, flash, render_template
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
    return User.get(user_id)  # Assume a User model with a .get() method

class User(UserMixin):
    """
    User model class that represents a user in the application.
    Inherits from UserMixin to handle Flask-Login properties.
    """
    def __init__(self, id, email, password):
        self.id = id
        self.email = email
        self.password = password

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
        # Authentication logic goes here
        user = User.get(email)  # Example authentication method
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
