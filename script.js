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
            .attr("width", (window.innerWidth / 2) - 20)
            .attr("height", window.innerHeight)
            .attr("viewBox", "0 0 " + ((window.innerWidth / 2) - 20) + " " + window.innerHeight)
            .style("float", "left")
            .attr("preserveAspectRatio", "xMidYMid meet")

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
        { cx: imageSize.width * 0.395, cy: centerY + imageSize.height * 0.34, r: imageSize.width * 0.00556929212 * 2 },//delhi //done with coordiantes
        { cx: imageSize.width * 0.31, cy: centerY + imageSize.height * 0.63, r: imageSize.width * 0.00576751476 * 2 },//greater mumbai //done with coordiantes
        { cx: imageSize.width * 0.42, cy: centerY + imageSize.height * 0.67, r: imageSize.width * 0.00114493477 * 2 },//hyderabad //done with coordinates
        { cx: imageSize.width * 0.46, cy: centerY + imageSize.height * 0.41, r: imageSize.width * 0.00114370532 * 2 },//kanpur //done with coordinates
        { cx: imageSize.width * 0.6175, cy: centerY + imageSize.height * 0.54, r: imageSize.width * 0.00115466943 * 2 },//kolkata //done with coordinates
        { cx: imageSize.width * 0.475, cy: centerY + imageSize.height * 0.39, r: imageSize.width * 0.00115334476 * 2 },//lucknow //done with coordinates
        { cx: imageSize.width * 0.305, cy: centerY + imageSize.height * 0.565, r: imageSize.width * 0.00114486151 * 2 }//surat //done with coordinates
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

// ==============================================================================
//                                  Radar Plot
// ==============================================================================

// SVG size
var spiderWidth = (window.innerWidth / 2) - 20
var spiderHeight = window.innerHeight
var spiderPadding = 100
var spiderDim = Math.min(spiderWidth, spiderHeight) - (2 * spiderPadding)
var spiderRad = spiderDim / 2

// Append SVG to the body of the HTML
var spiderSvg = d3.select("body")
            .append("svg")
            .attr("width", spiderWidth)
            .attr("height", spiderHeight)
            .style("float", "right")
            .attr("preserveAspectRatio", "xMidYMid meet")

// TEST DATA: REPLACE WITH REAL WHEN READY
var cities = ["Ahmedabad", "Bengaluru", "Chennai", "Delhi", "Greater Mumbai", "Hyderabad", "Kanpur", "Kolkata", "Lucknow", "Surat"]
var spiderData = cities.map((c) => {return {
    name: c, 
    "Total spending": Math.random(), 
    "Female spending": Math.random(), 
    "Entertainment spending": Math.random(), 
    "Grocery spending": Math.random(), 
    "Silver card spending": Math.random()}})

// Radius calculation
var radScale = d3.scaleLinear()
    .domain([0, 1])  // Values need to be normalised within their range
    .range([0, spiderRad])

// Draw radial ticks
var ticks = [0.25, 0.5, 0.75, 1] 
spiderSvg.selectAll("circle")
    .data(ticks)
    .enter()
    .append("circle")
        .attr("cx", spiderWidth / 2)
        .attr("cy", spiderHeight / 2)
        .attr("r", (t) => radScale(t))
        .attr("stroke", "gray")
        .attr("fill", "none")
spiderSvg.selectAll("text")
    .data(ticks)
    .enter()
    .append("text")
        .attr("x", (spiderWidth / 2) + 10)
        .attr("y", (d) => (spiderHeight / 2) - radScale(d) + 10)
        .text((d) => (100 * d) + "%")
        .style("font-size", "12px")
        .style("font-family", "Helvetica")

// Draw axes
var axes = ["Total spending", "Female spending", "Entertainment spending", "Grocery spending", "Silver card spending"]
var numAxes = axes.length
var axesPositions = axes.map((a, i) => {
    let angle = (Math.PI / 2) + ((2 * Math.PI * i) / numAxes)
    let xLen = Math.cos(angle) * spiderRad
    let yLen = Math.sin(angle) * spiderRad
    return {name: a, x: (spiderWidth / 2) + xLen, y: (spiderHeight / 2) - yLen}
})
spiderSvg.selectAll("line")
    .data(axesPositions)
    .enter()
    .append("line")
        .attr("x1", spiderWidth / 2)
        .attr("y1", spiderHeight / 2)
        .attr("x2", (d) => d.x)
        .attr("y2", (d) => d.y)
        .attr("stroke","black")
spiderSvg.selectAll("myaxes")
    .data(axesPositions)
    .enter()
    .append("text")
        .attr("x", (d) => {if (d.x < spiderWidth / 2) {return d.x - 10} else {return d.x + 10}})
        .attr("y", (d) => {if (d.y < spiderHeight / 2) {return d.y - 10} else {return d.y + 10}})
        .attr("text-anchor", (d) => {if (d.x < spiderWidth / 2) {return "end"} else {return "start"}})
        .text((d) => d.name)
        .style("font-size", "12px")
        .style("font-family", "Helvetica")

// Colour scheme
var spiderColours = d3.scaleOrdinal()
    .domain(cities)
    .range(d3.schemeCategory10)

// Plot paths
var paths = spiderData.map((d) => {
    let coords = []
    axes.forEach((a, i) => {
        let angle = (Math.PI / 2) + ((2 * Math.PI * i) / numAxes)
        let xLen = Math.cos(angle) * radScale(d[a])
        let yLen = Math.sin(angle) * radScale(d[a])
        coords.push({x: (spiderWidth / 2) + xLen, y: (spiderHeight / 2) + yLen})
    })
    let start = coords[0]
    coords.push(start)
    return {name: d.name, path: coords}
})
spiderSvg.selectAll("path")
    .data(paths)
    .enter()
    .append("path")
        .datum((d) => d.path)
        .attr("d", d3.line().x((d) => d.x).y((d) => d.y))
        .attr("stroke-width", 3)
        .attr("stroke", (d) => spiderColours(d))
        .attr("fill", (d) => spiderColours(d))
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 0.5)

// Update image position and size on window resize
window.addEventListener("resize", function() {
    // Update SVG viewBox attribute
    svg.attr("viewBox", "0 0 " + ((window.innerWidth / 2) - 20) + " " + window.innerHeight);
    updateImage();
});

