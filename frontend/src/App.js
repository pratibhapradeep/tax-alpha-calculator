import React, { useState } from 'react';
import axios from 'axios';
import './styles/App.css';  // Import the CSS file

function App() {
  const [publicToken, setPublicToken] = useState('');
  const [investmentData, setInvestmentData] = useState(null);
  const [harvestingSuggestions, setHarvestingSuggestions] = useState([]);
  const [taxData, setTaxData] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockPrice, setStockPrice] = useState(null);

    // New states for user input for tax calculation
  const [income, setIncome] = useState('');
  const [taxBrackets, setTaxBrackets] = useState('');

    const handleInvestmentData = async () => {
    try {
      const response = await axios.post('/api/investments', { public_token: publicToken });
      setInvestmentData(response.data);
    } catch (error) {
      console.error('Error fetching investment data:', error);
    }
  };
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
        const handleStockPrice = async () => {
    try {
      const response = await axios.get('/api/stock_price', { params: { symbol: stockSymbol } });
      setStockPrice(response.data);
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

         const fetchTaxData = () => {
    // Convert tax brackets input to array format
    const bracketsArray = taxBrackets.split(',').map(bracket => {
      const [rate, threshold] = bracket.split(':').map(Number);
      return [rate, threshold];
    });

    axios.post('/calculate_taxes', {
      income: parseFloat(income),  // User-inputted income
      tax_brackets: bracketsArray  // User-inputted tax brackets
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
