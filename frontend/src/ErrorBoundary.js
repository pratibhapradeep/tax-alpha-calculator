import React from 'react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree, logs those errors,
 * and displays a fallback UI instead of the component tree that crashed.
 *
 * @class
 * @extends React.Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Updates the state to indicate an error has occurred.
   *
   * @param {Error} error - The error that was thrown
   * @returns {Object} - Updated state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Logs error information and displays fallback UI.
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Additional information about the error
   */
  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
