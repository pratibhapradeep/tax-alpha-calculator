import React from 'react';
import { Bar } from 'react-chartjs-2';

/**
 * TaxVisualization Component
 * Displays a bar chart visualizing the tax savings data.
 *
 * @param {Object} props - Properties passed to the component
 * @param {Array} props.data - Array of data points to visualize
 * @returns {JSX.Element} - The rendered component
 */
const TaxVisualization = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [{
      label: 'Tax Savings',
      data: data.map(item => item.value),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  return <Bar data={chartData} />;
};

export default TaxVisualization;
