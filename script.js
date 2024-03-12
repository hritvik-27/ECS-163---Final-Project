// script.js

var data, radiusdata;

// Define the dimensions of the image
var imageWidth = 713; // Default image width
var imageHeight = 837; // Default image height

// Get the dimensions of the window
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

// Function to update image dimensions based on window size
function updateImageSize() {

    // Calculate the maximum available width and height
    var maxWidth = windowWidth * 0.8; // 80% of window width for the left half
    var maxHeight = windowHeight * 0.8; // 80% of window height

    // Determine the scaling factor based on available space
    var scaleX = maxWidth / imageWidth;
    var scaleY = maxHeight / imageHeight;

    // Use the smaller scaling factor to ensure the image fits within the window
    var scale = Math.min(scaleX, scaleY);

    // Update image dimensions
    imageWidth *= scale;
    imageHeight *= scale;

    return { width: imageWidth, height: imageHeight };
}

function parseCSV(csvData) {
    var lines = csvData.split('\n');
    var data = {};

    for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line !== '') {
            var values = line.split(',');
            var city = values[1].replace(/"/g, ''); // Remove double quotes
            var amount = parseInt(values[6]);
            if (!data[city]) {
                data[city] = 0;
            }
            data[city] += amount;
        }
    }

    return data;
}

// LHS dimensions
var mapWidth = (window.innerWidth / 2) - 20
var mapHeight = window.innerHeight

// Append SVG to the body of the HTML
var svg = d3.select("body")
            .append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeight)
            .attr("viewBox", "0 0 " + mapWidth + " " + mapHeight)
            .style("float", "left")
            .attr("preserveAspectRatio", "xMidYMid meet")

// Function to update the image position and size
function updateImage() {
    var imageSize = updateImageSize();

    var maxRadius = Math.min(imageWidth, imageHeight) * 0.05

    d3.csv("data/top_10_cities_transactions.csv").then(data => {
        console.log(data)

        filteredData = data  // THIS IS THE DATA SET FILTERED BY DATE

        // Calculate the total spend for each city in this time frame
        cityCumulative = new Object()
        filteredData.forEach((d) => {
            let cityName = d.City.split(',')[0]
            let spend = parseInt(d.Amount)
            if (cityCumulative[cityName] === undefined) {
                cityCumulative[cityName] = spend
            } else {
                cityCumulative[cityName] += spend
            }
        })
        totalData = Object.keys(cityCumulative).map((c) => {return {name: c, total: cityCumulative[c]}})

        // Calculate the center coordinates for the image relative to the window size
        var centerY = (mapHeight - imageSize.height) / 2;

        // Update image attributes
        svg.select("image")
            .attr("x", 0) // Set x-coordinate to 0 for left alignment
            .attr("y", centerY)
            .attr("width", imageSize.width)
            .attr("height", imageSize.height);

        // Overlay red circles on the image
        var circlePos = {
            "Ahmedabad": {cx: imageSize.width * 0.29, cy: centerY + imageSize.height * 0.53 },
            "Bengaluru": {cx: imageSize.width * 0.38, cy: centerY + imageSize.height * 0.77 },
            "Chennai": {cx: imageSize.width * 0.44, cy: centerY + imageSize.height * 0.785 },
            "Delhi": {cx: imageSize.width * 0.395, cy: centerY + imageSize.height * 0.34 },
            "Greater Mumbai": { cx: imageSize.width * 0.31, cy: centerY + imageSize.height * 0.63 },
            "Hyderabad": {cx: imageSize.width * 0.42, cy: centerY + imageSize.height * 0.67 },
            "Kanpur": {cx: imageSize.width * 0.46, cy: centerY + imageSize.height * 0.41 },
            "Kolkata": {cx: imageSize.width * 0.6175, cy: centerY + imageSize.height * 0.54 },
            "Lucknow": {cx: imageSize.width * 0.475, cy: centerY + imageSize.height * 0.39 },
            "Surat": {cx: imageSize.width * 0.305, cy: centerY + imageSize.height * 0.565 }
        };

        // Create radius scale
        var cityScale = d3.scaleLinear()
            .domain([0, d3.max(totalData, (d) => d.total)])
            .range([0, maxRadius])

        // Select all existing circles
        var circles = svg.selectAll("circle")
            .data(totalData);

        // Remove any existing circles that are no longer needed
        circles.exit().remove();

        // Append new circles
        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("cx", (d) => circlePos[d.name].cx)
            .attr("cy", (d) => circlePos[d.name].cy)
            .attr("r", (d) => cityScale(d.total))
            .style("fill", "red")
            .style("fill-opacity", 0.5) // Set opacity for better visibility
            .style("stroke", "red")
            .style("stroke-width", 1)
            .style("stroke-opacity", 1);
    })
}


    
// Append an image element to the SVG and load the image
svg.append("image")
    .attr("xlink:href", "data/indiamap.png")
    .on("load", updateImage);

// Update image position and size on window resize
window.addEventListener("resize", function() {
    // Update SVG viewBox attribute
    svg.attr("viewBox", "0 0 " + mapWidth + " " + mapHeight);
    updateImage();
});

