// Creating the map object
let myMap = L.map("map", {
    center: [33.888070, 35.503960],  // CENTER OF THE UNITED STATES
    zoom: 3
  });
  
  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // Use this link to get the GeoJSON data.
  let link = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";
  
  // The function that will determine the color of a hurricane region based on the hurricane's XXXXXXXXX
  function chooseColor(hurricane_xxxxx) {     // ADJUST ALL!
    if (hurricane_xxxxx > 100) return "yellow";
    else if (hurricane_xxxxx > 50) return "red";
    else if (hurricane_xxxxx > 20) return "orange";
    else if (hurricane_xxxxx > 10) return "green";
    else if (hurricane_xxxxx > 5) return "purple";
    else return "black";
  }
  
  // Getting our GeoJSON data
  d3.json(link).then(function(data) {
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data, {
      style: function(feature) {
        return {
          color: "white",
          fillColor: chooseColor(feature.properties.hurricane_xxxxx),
          fillOpacity: 0.5,
          weight: 1.5
        };
      }
    }).addTo(myMap);
  });