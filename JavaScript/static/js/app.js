// from data.js
var tableData = data;

// Select the submit button
var submit = d3.select("#filter-btn");

// Function to apply on submit button
submit.on("click", function() {

    // Prevent the page from refreshing
    d3.event.preventDefault();

    // Get the value property of the input element
    var dateInputValue = d3.select("#datetime-input").property("value");
    var cityInputValue = d3.select("#city-input").property("value");
    var stateInputValue = d3.select("#state-input").property("value");
    var countryInputValue = d3.select("#country-input").property("value");
    var shapeInputValue = d3.select("#shape-input").property("value");

    console.log("City Input Value:" + cityInputValue + ".");
    if(cityInputValue != ""){
        console.log("City Input Value Inside NULL:" + cityInputValue + ".");
    }
    console.log("Type of: " + typeof cityInputValue )

    // Filter Fuction for Table
    var filteredData = tableData.filter((item) => {
        var return_value = true;
        if (dateInputValue != ""){
            return_value = return_value && (item.datetime == dateInputValue);
        }
        if (cityInputValue != "" != ""){
            return_value = return_value && (item.city == cityInputValue);
        }
        if (stateInputValue != ""){
            return_value = return_value && (item.state == stateInputValue);
        }
        if (countryInputValue != ""){
            return_value = return_value && (item.country == countryInputValue);
        }
        if (shapeInputValue != ""){
            return_value = return_value && (item.shape == shapeInputValue);
        }

        return return_value;
    });

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

