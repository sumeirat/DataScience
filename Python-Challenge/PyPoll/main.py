# In this challenge, the task is to help a small, rural town modernize its vote-counting process
# Given set of poll data: [election_data.csv](PyPoll/Resources/election_data.csv).
# The dataset is composed of three columns: `Voter ID`, `County`, and `Candidate`.
# The task is to create a Python script that analyzes the votes and calculates each of the following:
# The total number of votes cast
# A complete list of candidates who received votes
# The percentage of votes each candidate won
# The total number of votes each candidate won
# The winner of the election based on popular vote.
# In addition, the final script should both print the analysis to the terminal and export a text file with the results.


# Module to create file paths across operating systems
import os
# Module for reading CSV files
import csv
# input file path
election_csv = os.path.join("Resources", "election_data.csv")

# candidates_list[] list of dictionaries to store each candidate information:
# candidates[{"name": "", "voteCount": ""}, {...}, {...}, ...]
candidates_list = []
total_votes = 0

with open(election_csv, newline="") as csvfile:
    csvreader = csv.reader(csvfile, delimiter=",")
    csv_header = next(csvreader)

    for row in csvreader:
        # To check voter_id is not empty
        if row[0] != "":
            total_votes += 1

        # For each vote if the candidate exist in the candidate_list, update voter count for it
        # else add the candidate to the candidate_list and initialize the voter count to 1.
        found = False
        for candidate in candidates_list:
            if candidate.get("name") == row[2]:
                candidate["voteCount"] = candidate.get("voteCount") + 1
                found = True
                break
        if found is False:
            candidates_list.append({'name': row[2], 'voteCount': int(1)})


max_votes = 0
winner = ""
# result_list for saving the results output
result_list = []
result_list.append("Election Results")
result_list.append("------------------------")
result_list.append(f"Total Votes: {total_votes}")
result_list.append("------------------------")

# Find the winner candidate that has max number of votes
for candidate in candidates_list:
    vote_percentage = round(candidate.get("voteCount") / total_votes * 100, 3)
    result_list.append(f"{candidate.get('name')}: {vote_percentage}% ({candidate.get('voteCount')})")
    if candidate.get('voteCount') > max_votes:
        max_votes = candidate.get('voteCount')
        winner = candidate.get("name")

result_list.append("------------------------")
result_list.append(f"Winner: {winner}")
result_list.append("------------------------")

# The output file path
output_file = os.path.join("Output", "output_PyPoll.csv")
# Writing the results in the output_PyPoll.csv file
with open(output_file, "w", newline="") as datafile:
    writer = csv.writer(datafile, delimiter="\n")
    writer.writerow(result_list)

# Printing the results to the terminal
for rslt in result_list:
    print(rslt)


