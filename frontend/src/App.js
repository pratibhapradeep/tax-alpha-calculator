import React, { useState } from 'react';
import axios from 'axios';
import './styles/App.css';  // Import the CSS file for styling

/**
 * Main App Component
 * Handles user inputs, makes API requests, and manages state for the application.
 *
 * @returns {JSX.Element} - The rendered component
 */
function App() {
  // State variables to manage user input and API response data
  const [publicToken, setPublicToken] = useState('');  // Plaid public token input by the user
  const [investmentData, setInvestmentData] = useState(null);  // Investment data fetched from backend
  const [harvestingSuggestions, setHarvestingSuggestions] = useState([]);  // Suggestions for tax loss harvesting
  const [taxData, setTaxData] = useState(null);  // Calculated tax data
  const [stockSymbol, setStockSymbol] = useState('');  // Stock symbol input by the user
  const [stockPrice, setStockPrice] = useState(null);  // Stock price data fetched from backend

  const [income, setIncome] = useState('');  // User input for income
  const [taxBrackets, setTaxBrackets] = useState('');  // User input for tax brackets

  /**
   * Fetches investment data using the Plaid API.
   * Sends a POST request to the backend with the user's Plaid public token.
   */
  const handleInvestmentData = async () => {
    try {
      const response = await axios.post('/api/investments', { public_token: publicToken });
      setInvestmentData(response.data);
    } catch (error) {
      console.error('Error fetching investment data:', error);
    }
  };

  /**
   * Fetches tax loss harvesting suggestions based on the user's investment data.
   * Sends a POST request to the backend with the investment data.
   */
  const handleTaxLossHarvesting = async () => {
    if (investmentData) {
      try {
        const response = await axios.post('/api/tax_loss_harvesting', { investment_data: investmentData });
        setHarvestingSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching tax loss harvesting suggestions:', error);
      }
    }
  };

  /**
   * Fetches stock price data using Alpha Vantage API.
   * Sends a GET request to the backend with the stock symbol provided by the user.
   */
  const handleStockPrice = async () => {
    try {
      const response = await axios.get('/api/stock_price', { params: { symbol: stockSymbol } });
      setStockPrice(response.data);
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  /**
   * Fetches tax data based on user input for income and tax brackets.
   * Sends a POST request to the backend with the user's income and parsed tax brackets.
   */
  const fetchTaxData = () => {
    const bracketsArray = taxBrackets.split(',').map(bracket => {
      const [rate, threshold] = bracket.split(':').map(Number);
      return [rate, threshold];
    });

    axios.post('/calculate_taxes', {
      income: parseFloat(income),
      tax_brackets: bracketsArray
    })
    .then(response => setTaxData(response.data))
    .catch(error => console.error('Error calculating taxes:', error));
  };

  return (
    <div>
      <h1>Welcome to Tax Alpha Calculator</h1>

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
