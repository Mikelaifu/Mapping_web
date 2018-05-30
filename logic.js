
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

renderMap(earthquakeURL, faultLinesURL);


function renderMap(earthquakeURL, faultLinesURL) {

    // Performs GET request for the earthquake URL
    d3.json(earthquakeURL, function(data) {
        // Stores response into earthquakeData
        var earthquakeData = data;
        // Performs GET request for the fault lines URL
        d3.json(faultLinesURL, function(data) {
            // Stores response into faultLineData
            var faultLineData = data;

            // Passes data into createFeatures function
            createFeatures(earthquakeData, faultLineData);
        });
    });

    // Function to create features
    function createFeatures(earthquakeData, faultLineData) {

        // Defines two functions that are run once for each feature in earthquakeData
        // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
        function onEachQuakeLayer(feature, layer) {
            return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillOpacity: 0.7,
                weight: 0.5,
                color: "black",
                fillColor: chooseColor(feature.properties.mag),
                radius:  markerSize(feature.properties.mag)
            });
        }
        function onEachEarthquake(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr>" + 
                "<p><b>Time:</b> " + new Date(feature.properties.time) + 
                "<br /><b>Magnitude:</b> " + feature.properties.mag + "</p>");
        };

        // Defines a function that is run once for each feature in faultLineData
        // Create fault lines
        function onEachFaultLine(feature, layer) {
            L.polyline(feature.geometry.coordinates);
        };

        // Creates a GeoJSON layer containing the features array of the earthquakeData object
        // Run the onEachEarthquake & onEachQuakeLayer functions once for each element in the array
        var earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachEarthquake,
            pointToLayer: onEachQuakeLayer
        });

        // Creates a GeoJSON layer containing the features array of the faultLineData object
        // Run the onEachFaultLine function once for each element in the array
        var faultLines = L.geoJSON(faultLineData, {
            onEachFeature: onEachFaultLine,
            style: {
                weight: 2,
                color: 'orange'
            }
        });

        createMap(earthquakes, faultLines);
    };

    // Function to create map
    function createMap(earthquakes, faultLines) {
      // Define outdoors, satellite, and darkmap layers
      // Outdoors layer
      var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoidGhpc2lzY2MiLCJhIjoiY2poOWd1azk5MGNrZzMwcXA4cGxna3cxMCJ9.KqWFqxzqclQp-3_THGHiUA");
      // Satellite layer
      var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoidGhpc2lzY2MiLCJhIjoiY2poOWd1azk5MGNrZzMwcXA4cGxna3cxMCJ9.KqWFqxzqclQp-3_THGHiUA");
      // Darkmap layer
      var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoidGhpc2lzY2MiLCJhIjoiY2poOWd1azk5MGNrZzMwcXA4cGxna3cxMCJ9.KqWFqxzqclQp-3_THGHiUA");

        // Define a baseMaps object to hold base layers
        var baseMaps = {
            "Outdoors": outdoors,
            "Satellite": satellite,
            "GrayScale": darkmap,
        };

        // Create overlay object to hold overlay layers
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Fault Lines": faultLines
        };

        // Create map, default settings: outdoors and faultLines layers display on load
        var map = L.map("map", {
            center: [37.09, -95.71],
            zoom: 4,
            layers: [outdoors, earthquakes],
            scrollWheelZoom: false
        });

        // Create a layer control
        // Pass in baseMaps and overlayMaps
        // Add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);

        // Adds Legend
        var legend = L.control({position: 'bottomright'});
        legend.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'info legend'),
                        grades = [0, 1, 2, 3, 4, 5],
                        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            };

            return div;
        };
        legend.addTo(map);

    };
}


function chooseColor(d) {
  return d > 5 ? "#F06B6B" :      
         d > 4 ? "#F0A76B" :
         d > 3 ? "#F3BA4D" :
         d > 2 ? "#F3DB4D" :
         d > 1 ? "#E2F350" :
                   "#B7F34D";
};


function markerSize(magnitude) {
    return magnitude * 3;
};