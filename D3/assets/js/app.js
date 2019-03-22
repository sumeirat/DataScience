// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 600;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#svg_area")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data from data.csv
d3.csv("assets/data/data.csv", function(error, healthData) {

    // Throw an error if one occurs
    if (error) throw error;

    // if (error) return console.warn(US_Data);

    // Format the healthData fields
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    //Setting linear scale for xScale
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, data => data.poverty))
        .range([0, chartWidth]);

    //Setting linear scale for yScale
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, data => data.healthcare)])
        .range([chartHeight, 0]);

    // Create two new functions passing the scales in as arguments
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append an SVG group element to the SVG area, create the left axis inside of it
    chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);

    // Append an SVG group element to the SVG area, create the bottom axis inside of it
    // Translate the bottom axis to the bottom of the page
    chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", "translate(0, " + chartHeight + ")")
        .call(bottomAxis);

    // create axes labels
    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 35})`)
        // .attr("class", "axisText")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "black")
        .text("In Poverty (%)")

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (chartHeight / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "black")
        // .attr("class", "axisText")
        .text("Lacks Healthcare (%)");

    // Adding data circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "lightblue")
        .attr("opacity", "1")
    
    var dataLabels = chartGroup.selectAll()
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare)+4)
        .attr("font-weight", "bold")
        .attr("font-size", "10px")
        .attr("class", "stateText")
        .text(d => d.abbr)


    // Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`State: ${d.state}%<br>Poverty: ${d.poverty}%<br>Healthcare:${d.healthcare}`);
        });
    
    // Step 7: Create tooltip in the chart
    // ==============================
    dataLabels.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
        //onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });



});
