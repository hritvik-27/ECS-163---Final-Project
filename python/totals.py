import pandas as pd

# Read the input CSV file into a pandas DataFrame
df = pd.read_csv("data/top_10_cities_transactions.csv")

# Group by 'City' and calculate the sum of 'Amount' for each city
city_totals = df.groupby('City')['Amount'].sum().reset_index()

# Write the totals to a new CSV file
city_totals.to_csv('city_totals.csv', index=False)

print("City totals written to city_totals.csv")
