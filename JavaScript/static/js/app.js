// from data.js
var tableData = data;

// Select the submit button
var submit = d3.select("#filter-btn");

// Function to apply on submit button
submit.on("click", function() {

    // Prevent the page from refreshing
    d3.event.preventDefault();

    // Select the input element and get the raw HTML node
    var inputElement = d3.select("#datetime-input");

    // Get the value property of the input element
    var dateInputValue = inputElement.property("value");

    var filteredData = tableData.filter((item) => item.datetime == dateInputValue);

    // Selecting table body tag and clearing all previous results
    var tbody = d3.select("#ufo-table-body");
    tbody.selectAll("tr").remove();

    filteredData.forEach((item) => {
        var row = tbody.append("tr");
        Object.entries(item).forEach(([key, value]) => {
            var cell = row.append("td");
            cell.text(value);
        });
    });
  
});

