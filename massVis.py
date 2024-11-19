import csv
from collections import Counter
import matplotlib.pyplot as plt

def count_types(csv_filename):
    with open(csv_filename, mode='r', newline='', encoding='utf-8') as csvfile:
        csvreader = csv.DictReader(csvfile, fieldnames=['filename', 'source', 'category', 'type', 'url', 'comments'])
        
        # Skip the header row
        next(csvreader)
        
        # Collect all the types
        types = [row['type'] for row in csvreader]
    
    # Count frequencies of each type
    type_frequencies = Counter(types)
    
    return dict(type_frequencies)

def plot_type_frequencies(type_frequencies):
    types = list(type_frequencies.keys())
    frequencies = list(type_frequencies.values())
    
    plt.figure(figsize=(10, 6))
    plt.bar(types, frequencies, color='skyblue')
    plt.xlabel('Type')
    plt.ylabel('Frequency')
    plt.title('Frequency of Types')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

def main():
    csv_filename = './single2k_metadata.csv'  # Replace with your CSV file name
    type_frequencies = count_types(csv_filename)
    print(type_frequencies)
    plot_type_frequencies(type_frequencies)

if __name__ == '__main__':
    main()
