# In this challenge, the task is to create a Python script for analyzing the financial records of a company.
# The financial data file is called budget_data.csv and is composed of two columns: Date and Profit/Losses.
# The task is to create a Python script that analyzes the records to calculate each of the following:
# The total number of months included in the dataset
# The total net amount of "Profit/Losses" over the entire period
# The average change in "Profit/Losses" between months over the entire period
# The greatest increase in profits (date and amount) over the entire period
# The greatest decrease in losses (date and amount) over the entire period
# In addition, the final script should both print the analysis to the terminal and export a text file with the results.


# Module to create file paths across operating systems
import os
# Module for reading CSV files
import csv
# input file path
budget_csv = os.path.join("Resources", "budget_data.csv")
# Declaring and initializing variables
month_list = []
value_list = []
change_list = []
prev_month_value = 0

with open(budget_csv, newline="") as csvfile:
    csvreader = csv.reader(csvfile, delimiter=",")
    csv_header = next(csvreader)

    for row in csvreader:
        # Save the columns values for each row in the corresponding list
        month_list.append(row[0])
        value_list.append(float(row[1]))

        # Calculating the average change and saving the result in change_list
        change_value = float(row[1]) - prev_month_value
        change_list.append(change_value)
        prev_month_value = float(row[1])

# Calculating total months and net profit/lossS
total_months = len(month_list)
total_net = round(sum(value_list))
# Calculating the average change, greatest increase and greatest decrease values
# Note: The first element in the change_list is not a true changeValue since the previous month value is not available,
# thus the following calculations considers elements starting with index 1 instead of 0
average_change = round(sum(change_list[1:]) / (len(change_list) - 1), 2)
max_increase = round(max(change_list[1:]))
max_increase_month = month_list[change_list.index(max_increase)]
max_decrease = round(min(change_list[1:]))
max_decrease_month = month_list[change_list.index(max_decrease)]

# Saving the Results in a list
result_list = []
result_list.append("Financial Analysis:")
result_list.append("----------------------------")
result_list.append(f"Total Months: {total_months}")
result_list.append(f"Total: ${round(total_net)}")
result_list.append(f"Average Change: ${average_change}")
result_list.append(f"Greatest Increase in Profits: {max_increase_month} (${max_increase})")
result_list.append(f"Greatest Decrease in Profits: {max_decrease_month} (${max_decrease})")

# The output file path
output_file = os.path.join("Output", "output_PyBank.csv")
# Writing the results in the output_PyBank.csv file
with open(output_file, "w", newline="") as datafile:
    writer = csv.writer(datafile, delimiter="\n")
    writer.writerow(result_list)

# Printing results to the terminal
for rslt in result_list:
    print(rslt)





