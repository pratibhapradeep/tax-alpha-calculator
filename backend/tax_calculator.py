class TaxCalculator:
    def __init__(self, income, investment_data, tax_brackets):
        """
        Initializes the TaxCalculator with income, investment data, and tax brackets.

        Args:
            income (float): The user's annual income.
            investment_data (list): A list of investment holdings data.
            tax_brackets (list): A list of tuples representing tax brackets [(rate, threshold), ...].
        """
        self.income = income
        self.investment_data = investment_data
        self.tax_brackets = tax_brackets

    def calculate_investment_gains(self):
        """
        Calculates the total investment gains from the investment data.

        Returns:
            float: Total investment gains.
        """
        return sum([holding['current_value'] - holding['cost_basis'] for holding in self.investment_data])

    def calculate_taxes(self):
        """
        Calculates the total tax due based on income, investment gains, and tax brackets.

        Returns:
            float: The calculated tax amount.
        """
        total_gains = self.calculate_investment_gains()
        total_income = self.income + total_gains
        tax_due = 0.0

        # Calculate tax based on income and tax brackets
        for rate, threshold in self.tax_brackets:
            if total_income > threshold:
                tax_due += (total_income - threshold) * rate
                total_income = threshold

        return tax_due

    def suggest_tax_loss_harvesting(investment_data):
        """
        Suggests securities to sell for tax loss harvesting.

        Parameters
        ----------
        investment_data : list
            A list of investment accounts and their associated data.

        Returns
        -------
        dict
            A dictionary containing securities suggested for tax loss harvesting.
        """
        suggestions = []

        for account in investment_data:
            for security in account.get('securities', []):
                total_loss = 0
                for transaction in security.get('transactions', []):
                    if transaction['type'] == 'sell':
                        buy_price = transaction['cost_basis']
                        sell_price = transaction['price']
                        if sell_price < buy_price:
                            total_loss += (buy_price - sell_price)

                if total_loss > 0:
                    suggestions.append({
                        'security_name': security['name'],
                        'total_loss': total_loss
                    })

        return suggestions
