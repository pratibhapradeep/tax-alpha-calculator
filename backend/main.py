
import os
from flask import Flask, jsonify, request
from plaid import ApiClient
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.investments_holdings_get_request import InvestmentsHoldingsGetRequest
from dotenv import load_dotenv
from alpha_vantage.timeseries import TimeSeries
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest

from tax_calculator import TaxCalculator

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app with debugging enabled
app = Flask(__name__)
app.config['DEBUG'] = True

# Plaid API keys and environment configuration for sandbox testing
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")  # Ensure sandbox environment

# Alpha Vantage API key
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# Configure Plaid API client for sandbox environment
configuration = {
    "host": f"https://{PLAID_ENV}.plaid.com",
    "clientId": PLAID_CLIENT_ID,
    "secret": PLAID_SECRET,
}
api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

def create_sandbox_access_token():
    """
    Creates a sandbox access token for testing.

    Returns:
        str: The generated sandbox access token.
    """
    # Define a public token for sandbox testing
    public_token_request = SandboxPublicTokenCreateRequest(
        institution_id="ins_109508",  # Example test institution ID
        initial_products=['investments']
    )

    response = plaid_client.sandbox_public_token_create(public_token_request)
    return response.access_token

def create_link_token():
    """
    Creates a Plaid Link token for initializing the Plaid Link flow in sandbox.

    Returns:
        str: The generated Plaid Link token.
    """
    request = LinkTokenCreateRequest(
        products=['transactions', 'investments'],
        client_name="Tax Alpha Sandbox",
        country_codes=['US'],
        language='en',
        user=LinkTokenCreateRequestUser(client_user_id='sandbox_user_id')
    )

    response = plaid_client.link_token_create(request)
    return response.link_token

def fetch_investment_holdings():
    """
    Fetches simulated investment holdings data from Plaid's sandbox environment.

    Returns:
        list: A list of investment holdings data.
    """
    # Simulated access token for sandbox environment
    access_token = "sandbox_access_token"

    # Create a request to fetch investment holdings
    request = InvestmentsHoldingsGetRequest(access_token=access_token)
    response = plaid_client.investments_holdings_get(request)
    return response.holdings

def fetch_stock_data(symbol):
    """
    Fetches daily stock data for the given symbol using Alpha Vantage API in sandbox.

    Args:
        symbol (str): The stock symbol (e.g., 'AAPL').

    Returns:
        pandas.DataFrame: DataFrame containing the daily stock data.
    """
    ts = TimeSeries(key=ALPHA_VANTAGE_API_KEY)
    data, meta_data = ts.get_daily(symbol=symbol, outputsize='compact')
    return data

@app.route('/')
def home():
    return "Welcome to Tax Alpha Sandbox Testing!"

if __name__ == "__main__":
    app.run()