import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';  // Import the CSS file for styling
import ErrorBoundary from './ErrorBoundary';  // Import the ErrorBoundary component

/**
 * Main App Component
 * Handles user inputs, makes API requests, and manages state for the application.
 *
 * @returns {JSX.Element} - The rendered component
 */
function App() {
  const [linkToken, setLinkToken] = useState(''); // Plaid link token fetched from the backend
  const [publicToken, setPublicToken] = useState('');  // Plaid public token input by the user
  const [investmentData, setInvestmentData] = useState(null);  // Investment data fetched from backend
  const [harvestingSuggestions, setHarvestingSuggestions] = useState([]);  // Suggestions for tax loss harvesting
  const [taxData, setTaxData] = useState(null);  // Calculated tax data
  const [stockSymbol, setStockSymbol] = useState('');  // Stock symbol input by the user
  const [stockPrice, setStockPrice] = useState(null);  // Stock price data fetched from backend
  const [income, setIncome] = useState('');  // User input for income
  const [taxBrackets, setTaxBrackets] = useState('');  // User input for tax brackets
  const [error, setError] = useState('');  // Error message state

  // Fetch Plaid Link token on component mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await axios.get('/create_link_token');
        setLinkToken(response.data.link_token);
      } catch (err) {
        console.error('Error fetching Plaid link token:', err);
        setError('Failed to fetch Plaid link token');
      }
    };
    fetchLinkToken();
  }, []);

  /**
   * Fetches investment data using the Plaid API.
   * Sends a POST request to the backend with the user's Plaid public token.
   */
  const handleInvestmentData = async () => {
    try {
      if (!publicToken) throw new Error("Please enter a valid Plaid Public Token.");
      const response = await axios.post('/api/investments', { public_token: publicToken });
      setInvestmentData(response.data);
    } catch (error) {
      console.error('Error fetching investment data:', error);
      setError(error.message || 'Error fetching investment data');
    }
  };

  /**
   * Fetches tax loss harvesting suggestions based on the user's investment data.
   * Sends a POST request to the backend with the investment data.
   */
  const handleTaxLossHarvesting = async () => {
    try {
      if (!investmentData) throw new Error("Investment data is required to fetch tax loss harvesting suggestions.");
      const response = await axios.post('/api/tax_loss_harvesting', { investment_data: investmentData });
      setHarvestingSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching tax loss harvesting suggestions:', error);
      setError(error.message || 'Error fetching tax loss harvesting suggestions');
    }
  };

  /**
   * Fetches stock price data using Alpha Vantage API.
   * Sends a GET request to the backend with the stock symbol provided by the user.
   */
  const handleStockPrice = async () => {
    try {
      if (!stockSymbol) throw new Error("Please enter a valid stock symbol.");
      const response = await axios.get('/api/stock_price', { params: { symbol: stockSymbol } });
      setStockPrice(response.data);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      setError(error.message || 'Error fetching stock price');
    }
  };

  /**
   * Fetches tax data based on user input for income and tax brackets.
   * Sends a POST request to the backend with the user's income and parsed tax brackets.
   */
  const fetchTaxData = () => {
    try {
      if (!income || !taxBrackets) throw new Error("Please enter both income and tax brackets.");
      const bracketsArray = taxBrackets.split(',').map(bracket => {
        const [rate, threshold] = bracket.split(':').map(Number);
        return [rate, threshold];
      });

      axios.post('/calculate_taxes', {
        income: parseFloat(income),
        tax_brackets: bracketsArray
      })
      .then(response => setTaxData(response.data))
      .catch(error => {
        console.error('Error calculating taxes:', error);
        setError('Error calculating taxes');
      });
    } catch (error) {
      console.error('Input validation error:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Welcome to Tax Alpha Calculator</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h2>Fetch Investment Data</h2>
        <input
          type="text"
          placeholder="Enter Plaid Public Token"
          value={publicToken}
          onChange={(e) => setPublicToken(e.target.value)}
        />
        <button onClick={handleInvestmentData}>Get Investment Data</button>
      </div>

      {investmentData && (
        <div>
          <h3>Investment Data:</h3>
          <pre>{JSON.stringify(investmentData, null, 2)}</pre>
          <button onClick={handleTaxLossHarvesting}>Get Tax Loss Harvesting Suggestions</button>
        </div>
      )}

      {harvestingSuggestions.length > 0 && (
        <div>
          <h3>Tax Loss Harvesting Suggestions:</h3>
          <ul>
            {harvestingSuggestions.map((suggestion, index) => (
              <li key={index}>
                Security: {suggestion.security_name}, Loss: {suggestion.total_loss}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2>Fetch Stock Price</h2>
        <input
          type="text"
          placeholder="Enter Stock Symbol"
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value)}
        />
        <button onClick={handleStockPrice}>Get Stock Price</button>
      </div>

      {stockPrice && (
        <div>
          <h3>Stock Price:</h3>
          <pre>{JSON.stringify(stockPrice, null, 2)}</pre>
        </div>
      )}

      <div>
        <h2>Calculate Taxes</h2>
        <input
          type="text"
          placeholder="Enter Income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Tax Brackets (format: rate:threshold,rate:threshold)"
          value={taxBrackets}
          onChange={(e) => setTaxBrackets(e.target.value)}
        />
        <button onClick={fetchTaxData}>Calculate Taxes</button>
        {taxData && <p>Tax Due: {taxData.tax_due}</p>}
      </div>
    </div>
  );
}

export default App;
