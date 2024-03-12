import csv

# Define the path to your CSV file
csv_file = "top_10_cities_transactions.csv"

# Open the CSV file and read the cities
cities = set()
with open(csv_file, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cities.add(row['City'])

# Print the unique cities
print("Unique cities in the CSV file:")
for city in cities:
    print(city)
