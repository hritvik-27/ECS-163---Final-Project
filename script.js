// script.js

var data, radiusdata;

// Function to update image dimensions based on window size
function updateImageSize() {
    // Define the dimensions of the image
    var imageWidth = 400; // Default image width
    var imageHeight = 300; // Default image height
    
    // Get the dimensions of the window
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    // Calculate the maximum available width and height
    var maxWidth = windowWidth * 0.4; // 40% of window width for the left half
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

// Append SVG to the body of the HTML
var svg = d3.select("body")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background-color", "black"); // Set background color to black

// Function to update the image position and size
function updateImage() {
    var imageSize = updateImageSize();

    d3.csv("data/top_10_cities_transactions.csv").then(rawData => {
        data = rawData;
        radiusdata = parseCSV(rawData);
    });

    //spend_data = parseCSV(rawData);

    // Calculate the center coordinates for the image relative to the window size
    var centerY = (window.innerHeight - imageSize.height) / 2;

    // Update image attributes
    svg.select("image")
        .attr("x", 0) // Set x-coordinate to 0 for left alignment
        .attr("y", centerY)
        .attr("width", imageSize.width)
        .attr("height", imageSize.height);

    // Overlay red circles on the image
    var circleData = [
        { cx: imageSize.width * 0.29, cy: centerY + imageSize.height * 0.53, r: imageSize.width * 0.00567794310 * 2 },//ahmedabad //done with coordinates
        { cx: imageSize.width * 0.38, cy: centerY + imageSize.height * 0.77, r: imageSize.width * 0.00572326739 * 2 },//bengaluru //done with coordiantes
        { cx: imageSize.width * 0.44, cy: centerY + imageSize.height * 0.785, r: imageSize.width * 0.00114730600 * 2 },//chennai //done with coordinates
        { cx: imageSize.width * 0.3, cy: centerY + imageSize.height * 0.7, r: imageSize.width * 0.00556929212 * 2 },//delhi
        { cx: imageSize.width * 0.6, cy: centerY + imageSize.height * 0.5, r: imageSize.width * 0.00576751476 * 2 },//greater mumbai
        { cx: imageSize.width * 0.2, cy: centerY + imageSize.height * 0.4, r: imageSize.width * 0.00114493477 * 2 },//hyderabad
        { cx: imageSize.width * 0.5, cy: centerY + imageSize.height * 0.3, r: imageSize.width * 0.00114370532 * 2 },//kanpur
        { cx: imageSize.width * 0.7, cy: centerY + imageSize.height * 0.6, r: imageSize.width * 0.00115466943 * 2 },//kolkata
        { cx: imageSize.width * 0.3, cy: centerY + imageSize.height * 0.7, r: imageSize.width * 0.00115334476 * 2 },//lucknow
        { cx: imageSize.width * 0.6, cy: centerY + imageSize.height * 0.5, r: imageSize.width * 0.00114486151 * 2 }//surat
    ];


    // Select all existing circles
    var circles = svg.selectAll("circle")
        .data(circleData);

    // Remove any existing circles that are no longer needed
    circles.exit().remove();

    // Append new circles
    circles.enter()
        .append("circle")
        .merge(circles)
        .attr("cx", function(d) { return d.cx; })
        .attr("cy", function(d) { return d.cy; })
        .attr("r", function(d) { return d.r; })
        .style("fill", "red")
        .style("opacity", 0.5); // Set opacity for better visibility
}


    
// Append an image element to the SVG and load the image
svg.append("image")
    .attr("xlink:href", "data/indiamap.png")
    .on("load", updateImage);

// Update image position and size on window resize
window.addEventListener("resize", function() {
    // Update SVG viewBox attribute
    svg.attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    updateImage();
});

