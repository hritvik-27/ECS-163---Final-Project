import pandas as pd

# Read the CSV file into a pandas DataFrame
df = pd.read_csv("data/transactions.csv")

# Group the data by City and calculate the total amount of transactions for each city
city_totals = df.groupby("City")["Amount"].sum().reset_index()

# Sort the cities based on total transaction amount in descending order and select top 10
top_cities = city_totals.sort_values(by="Amount", ascending=False).head(10)

# Filter the original DataFrame to include only the rows for the top 10 cities
filtered_df = df[df["City"].isin(top_cities["City"])]

# Save the filtered DataFrame to a new CSV file
filtered_df.to_csv("top_10_cities_transactions.csv", index=False)

print("Filtered data saved to top_10_cities_transactions.csv")
