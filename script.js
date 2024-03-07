// script.js

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
        { cx: imageSize.width * 0.2, cy: centerY + imageSize.height * 0.4, r: imageSize.width * 0.03 },
        { cx: imageSize.width * 0.5, cy: centerY + imageSize.height * 0.3, r: imageSize.width * 0.04 },
        { cx: imageSize.width * 0.7, cy: centerY + imageSize.height * 0.6, r: imageSize.width * 0.05 },
        { cx: imageSize.width * 0.3, cy: centerY + imageSize.height * 0.7, r: imageSize.width * 0.025 },
        { cx: imageSize.width * 0.6, cy: centerY + imageSize.height * 0.5, r: imageSize.width * 0.03 }
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
