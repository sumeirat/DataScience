// Store our API endpoint inside queryUrl
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the earthquakes data URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createMap function
  createMap(data.features);
});


function createMap(earthquakeData) {

  var locMarkers = [];
  
  earthquakeData.forEach((feature) => {
    var coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
    locMarkers.push(
      L.circle(coordinates, {
        stroke: false,
        fillOpacity: 0.75,
        color: "red",
        fillColor: getColor(feature.properties.mag),
        radius: markerSize(feature.properties.mag)
      })
      .bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
    )
  });
  
  var earthquakes = L.layerGroup(locMarkers);

  // Overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // BaseMaps object to hold our base layers
  var [baseMaps, defaultMap] = createBaseMap();

  // The map, giving it the defaultmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [defaultMap, earthquakes]
  });

  // Layer control
  var controlLayers = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Adding tectonic plates layer to the map
  d3.json(tectonicPlatesUrl, function(data) {
    var tectonicPlates = L.geoJson(data, {
      style: {
        color: "orange",
        weight: 2
      }
    }).addTo(myMap);
    controlLayers.addOverlay(tectonicPlates, "Fault Lines");
  });

  createLegend(myMap);
}


function markerSize(mag) {
  return mag * 20000;
}

function getColor(mag) {
  if(mag < 1){
    return "#AFFF33";
  }else if (mag < 2){
    return "#D4FF33";
  }else if (mag < 3){
    return "#FFF933";
  }else if (mag < 4){
    return "#FFBE33";
  }else if (mag < 5){
    return "#FF7B33";
  }else{
    return "#FF3333";
  }
}

function createBaseMap() {

  // satellite, dark, outdoors and streets map layers
  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // BaseMaps object to hold our base layers
  var baseMaps = {
    "Satelite": satelliteMap,
    "Grayscale": darkMap,
    "Outdoors": outdoorsMap,
    "Streets": streetMap
  };

  return [baseMaps, satelliteMap];
}

function createLegend(map){
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'legend'),
          grades = [0, 1, 2, 3, 4, 5];
  
      // loop through our intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i]) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(map);
}