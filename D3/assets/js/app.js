// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 640;

// Define the chart's margins as an object
var margin = {
  top: 40,
  right: 40,
  bottom: 100,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial X and Y axis label values
xlabels = [
  {val: "poverty", txtVal: "In Poverty (%)"},
  {val: "age", txtVal: "Age (Median)"},
  {val: "income", txtVal: "Household Income (Median)"}
]
ylabels = [
  {val: "healthcare", txtVal: "Lacks Healthcare (%)"},
  {val: "smokes", txtVal: "Smokes (%)"},
  {val: "obesity", txtVal: "Obese (%)"}
]

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // Linear scale for xScale
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis])-1, d3.max(healthData, d => d[chosenXAxis])+1])
    .range([0, chartWidth]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // Linear scale for yScale
  var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(healthData, d => d[chosenYAxis]))
    .range([chartHeight, 0]);

  return yLinearScale;
}

// function used for updating x and y Axis var upon click on axis label
function renderAxes(newScale, axis, type) {
  if (type === "x"){
    var bottomAxis = d3.axisBottom(newScale);

    axis.transition()
      .duration(1000)
      .call(bottomAxis);

    return axis;
  } else {
    var leftAxis = d3.axisLeft(newScale);

    axis.transition()
      .duration(1000)
      .call(leftAxis);

    return axis;
  }
}

// function used for updating circles group with a transition to new circles - X axis labels
function x_renderCircles(circlesGroup, circlesTextGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    
  circlesTextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return [circlesGroup, circlesTextGroup];
}

// function used for updating circles group with a transition to new circles - Y axis labels
function y_renderCircles(circlesGroup, circlesTextGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
    
  circlesTextGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])+4);

  return [circlesGroup, circlesTextGroup];
}

// function for making the first letter of a string to upperCase
function upperFirstLetter(stringVal) {
    return stringVal.charAt(0).toUpperCase() + stringVal.slice(1);
}

// function to determine if the toolTip label value needs "%" or not
function toolTipTxtformater(stringVal) {
  if (stringVal === "poverty"){
    return "%"
  } else {
    return ""
  }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, scatterPoints) {

// Initialize tool tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${upperFirstLetter(chosenXAxis)}: ${d[chosenXAxis]}${toolTipTxtformater(chosenXAxis)}<br>${upperFirstLetter(chosenYAxis)}: ${d[chosenYAxis]}%`);
    });

  // Create tooltip in the chart
  scatterPoints.call(toolTip);

  // Event listeners to display and hide the tooltip
  scatterPoints.on("mouseover", function(data) {
  toolTip.show(data, this);
  })
  //onmouseout event
  .on("mouseout", function(data, index) {
      toolTip.hide(data);
  });

  return scatterPoints;
}

// function for updating chart title description based on chosen axis label
function updateChartDes(chosenXAxis, chosenYAxis) {
  newChartDes = `Correlations Discovered Between ${upperFirstLetter(chosenYAxis)} and ${upperFirstLetter(chosenXAxis)}`;
  d3.select("#chart_desc").text(newChartDes);
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(error, healthData) {

  // Throw an error if one occurs
  if (error) throw error;

  // Format the healthData fields
  healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
  });

  // Setting x and y linear scales
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("axis", true)
    .call(leftAxis);

  // append a group to hold scatter points
  var scatterPoints = chartGroup
    .append("g")
    .attr("class", "points")
    .selectAll("g")
    .data(healthData)
    .enter()
    .append("g");

  // append scatter points
  var circlesGroup = scatterPoints.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "12")
    .attr("class", "stateCircle")

  // append text labels for scatter points
  var circlesTextGroup = scatterPoints.append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis])+4)
    .attr("class", "stateText")
    .text(d => d.abbr);

  // Create group for x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 15})`)
  
  xlabelsGroup.selectAll("text")
    .data(xlabels)
    .enter()
    .append("text")
    .attr("x", 0)
    .attr("y", (d, i) => (i+1)*20)
    .attr("class", "inactive")
    .attr("id", d => d.val)
    .attr("value", d => d.val) // value to grab for event listener
    .text(d => d.txtVal);

  // Create group for y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")

  ylabelsGroup.selectAll("text")
    .data(ylabels)
    .enter()
    .append("text")
    .attr("x", 0 - (chartHeight / 2))
    .attr("y", (d, i) => 0 - margin.left + 60 - (i*20))
    .attr("class", "inactive")
    .attr("id", d => d.val)
    .attr("value", d => d.val) // value to grab for event listener
    .text(d => d.txtVal);

  //Initialize active x and y axis labels
  d3.select("#"+ chosenXAxis).attr("class", "active");
  d3.select("#"+ chosenYAxis).attr("class", "active");
  
  // Update chart title description text
  updateChartDes(chosenXAxis, chosenYAxis);

  // updateToolTip function above csv import
  var scatterPoints = updateToolTip(chosenXAxis, chosenYAxis, scatterPoints);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Updating the active/inactive label
        d3.select("#"+ chosenXAxis).attr("class", "inactive");
        d3.select(this).attr("class", "active");

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis, "x");

        // updates circles with new x values
        [circlesGroup, circlesTextGroup] = x_renderCircles(circlesGroup, circlesTextGroup, xLinearScale, chosenXAxis);

        // Update chart title description text
        updateChartDes(chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        scatterPoints = updateToolTip(chosenXAxis, chosenYAxis, scatterPoints);

      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Updating the active/inactive label
        d3.select("#"+ chosenYAxis).attr("class", "inactive");
        d3.select(this).attr("class", "active");

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderAxes(yLinearScale, yAxis, "y");

        // updates circles with new y values
        [circlesGroup, circlesTextGroup] = y_renderCircles(circlesGroup, circlesTextGroup, yLinearScale, chosenYAxis);

        // Update chart title description text
        updateChartDes(chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        scatterPoints = updateToolTip(chosenXAxis, chosenYAxis, scatterPoints);

      }
    });
});
