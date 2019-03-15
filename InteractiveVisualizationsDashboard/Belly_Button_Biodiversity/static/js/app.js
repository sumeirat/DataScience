function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  d3.json(`/metadata/${sample}`).then(function(response) {
    var selector = d3.select("#sample-metadata");

  // Use `.html("") to clear any existing metadata
    selector.html("");

  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.
    Object.entries(response).forEach(([key, value]) => {
        selector
          .append("p")
          .text(`${key}: ${value}`);
    });
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}


function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function(response) {    
    // @TODO: Build a Bubble Chart using the sample data
    var bubble_text = response["otu_labels"].map((item, i) => {
      return `(${response["otu_ids"][i]},${response["sample_values"][i]})<br>${item}`;
    });

    bubble_data = [{
      "x": response["otu_ids"],
      "y": response["sample_values"],
      "type": "scatter",
      "mode": "markers",
      "marker": {
          "size": response["sample_values"],
          "color": response["otu_ids"]
      },
      "text": bubble_text,
      "hoverinfo": "text",
    }];

    var bubble_layout = {
      "xaxis": {"title": "OTU ID"}
    };

    Plotly.newPlot("bubble", bubble_data, bubble_layout);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    var sorted_sliced_data = response["sample_values"].map((item, i) => {
      return {"sample_values": item, "otu_ids": response["otu_ids"][i], "otu_labels": response["otu_labels"][i]};
    }).sort(function(first, second) {
      return second.sample_values - first.sample_values;
    }).slice(0,10)

    var values = sorted_sliced_data.map((item, i) => {
      return item.sample_values;
    });
    var labels = sorted_sliced_data.map((item, i) => {
      return item.otu_ids;
    });
    var hovertexts = sorted_sliced_data.map((item, i) => {
      return item.otu_labels;
    });

    console.log(sorted_sliced_data);

    var pie_data = [{
      "values": values,
      "labels": labels,
      "type": "pie",
      "text": hovertexts,
      "hoverinfo": "label+text+value+percent",
      "textinfo": "percent",
      "textfont": {color: "black"}
    }];

    var pie_layout = {
    };

    Plotly.newPlot("pie", pie_data, pie_layout);
    
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
