// script.js

var data, radiusdata;

// Define the dimensions of the image
var imageWidth = 600; // Default image width
var imageHeight = 450; // Default image height

// Get the dimensions of the window
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

// Calculate image size differently when zoomed in
var zoomed = false

// Function to update image dimensions based on window size
function updateImageSize() {

    // Calculate the maximum available width and height
    var maxWidth = windowWidth * 0.55; // 55% of window width for the left half
    var maxHeight = windowHeight * 0.9; // 90% of window height

    // Determine the scaling factor based on available space
    var scaleX = maxWidth / imageWidth;
    var scaleY = maxHeight / imageHeight;

    // Use the smaller scaling factor to ensure the image fits within the window
    var scale = Math.min(scaleX, scaleY);

    // Update image dimensions
    imageWidth *= scale;
    imageHeight *= scale;

    if (zoomed) {
        imageWidth *= 2
        imageHeight *= 2
    }

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

// =======================================================
//                           Map
// =======================================================

// LHS dimensions
var mapWidth = (window.innerWidth / 2) - 20
var mapHeight = window.innerHeight
var imageSize
var centerY
let maxRad = Math.min(mapWidth, mapHeight) / 4

// Append SVG to the body of the HTML
var svg = d3.select("body")
            .append("svg")
            .attr("width", (window.innerWidth / 2) - 20)
            .attr("height", window.innerHeight)
            .attr("viewBox", "0 0 " + ((window.innerWidth / 2) - 20) + " " + window.innerHeight)
            .style("float", "left")
            .attr("preserveAspectRatio", "xMidYMid meet")

// Glyph categories
var glyphTypes = ["Exp Type", "Gender", "Card Type"]

// Function to update the image position and size
function updateImage() {
    imageSize = updateImageSize();

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
        centerY = (mapHeight - imageSize.height) / 2;

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
            .attr("name", (d) => d.name)
            .attr("spend", (d) => d.total)
            .attr("class", "cityCircle")
            .style("fill", "red")
            .style("fill-opacity", 0.5) // Set opacity for better visibility
            .style("stroke", "red")
            .style("stroke-width", 1)
            .style("stroke-opacity", 1)
            .on("mouseover", function(d) {
                // Reveal tooltip
                let cityName = d3.select(this).attr("name")
                let spend = d3.select(this).attr("spend")
                d3.select("#Tooltip")
                    .style("opacity", 1)
                    .text(cityName + ": ₹" + spend.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            })
            .on("mouseout", function(d) {
                // Hide tooltip
                d3.select("#Tooltip")
                    .style("opacity", 0)
            })
            .on("mousemove", function(d) {
                // Move tooltip
                d3.select("#Tooltip")
                    .attr("x", d.clientX)
                    .attr("y", d.clientY)
            })
            .on("click", function(d) {
                // Zoom map
                let cityName = d3.select(this).attr("name")
                let focusPos = circlePos[cityName]
                zoomed = true
                imageSize.width *= 2
                imageSize.height *= 2
                d3.select("image")
                    .transition()
                    .duration(1000)
                    .attr("x", (mapWidth / 2) - (2 * focusPos.cx))
                    .attr("y", (mapHeight / 2) - (2 * focusPos.cy) + (2 * centerY))
                    .attr("width", imageSize.width)
                    .attr("height", imageSize.height)
                    .attr("opacity", 0.3)
                
                // Hide other elements
                d3.select(".chart-title")
                    .transition()
                    .duration(1000)
                    .style("opacity", 0)
                d3.selectAll(".cityCircle")
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
                    .attr("pointer-events", "none")

                // Render back button
                svg.append("rect")
                    .attr("id", "backRect")
                    .attr("x", 5)
                    .attr("y", 5)
                    .attr("width", 70)
                    .attr("height", 40)
                    .style("fill", "white")
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .on("click", restoreMap)
                svg.append("text")
                    .attr("id", "backText")
                    .attr("x", 20)
                    .attr("y", 30)
                    .text("Back")
                    .style("font-size", "16px")
                    .style("font-family", "Helvetica")
                    .on("click", restoreMap)
                
                // Create glyph and options
                svg.selectAll("radio")
                    .data(glyphTypes)
                    .enter()
                    .append("circle")
                        .attr("cx", (3 * mapWidth / 4) + 50)
                        .attr("cy", (_, i) => (mapHeight / 2) - maxRad + (i * 50))
                        .attr("r", 10)
                        .attr("class", "radio")
                        .attr("selected", (d) => {
                            if (d === "Exp Type") {
                                return 1
                            } else {
                                return 0
                            }
                        })
                        .attr("glyph", (d) => d)
                        .attr("city", cityName)
                        .style("fill", "red")
                        .style("stroke", "black")
                        .style("stroke-width", 3)
                        .style("fill-opacity", (d) => {
                            if (d === "Exp Type") {
                                return 1
                            } else {
                                return 0
                            }
                        })
                        .on("mouseover", function(d) {
                            let thisObj = d3.select(this)
                            if (thisObj.attr("selected") === "0") {
                                thisObj.transition()
                                    .duration(100)
                                    .style("fill-opacity", 0.5)
                            }
                        })
                        .on("mouseout", function(d) {
                            let thisObj = d3.select(this)
                            if (thisObj.attr("selected") === "0") {
                                thisObj.transition()
                                    .duration(100)
                                    .style("fill-opacity", 0)
                            }
                        })
                        .on("click", function(d) {
                            let thisObj = d3.select(this)
                            if (thisObj.attr("selected") === "0") {
                                // Update buttons
                                d3.selectAll("circle.radio")
                                    .transition()
                                    .duration(100)
                                    .style("fill-opacity", 0)
                                    .attr("selected", 0)
                                thisObj.transition()
                                    .duration(100)
                                    .style("fill-opacity", 1)
                                    .attr("selected", 1)
                                
                                // Delete current glyph
                                d3.selectAll(".glyph")
                                    .transition()
                                    .duration(200).style("opacity", 0)
                                    .transition()
                                    .delay(200)
                                    .remove()
                                
                                // Add new glyph
                                generateGlyph(filteredData, thisObj.attr("glyph"), thisObj.attr("city"))
                            }
                        })
                
                svg.selectAll("radio")
                    .data(glyphTypes)
                    .enter()
                    .append("text")
                        .attr("x", (3 * mapWidth / 4) + 65)
                        .attr("y", (_, i) => (mapHeight / 2) - maxRad + (i * 50) + 5)
                        .attr("class", "radio")
                        .text((d) => d)
                        .style("font-size", "14px")
                        .style("font-family", "Helvetica")

                generateGlyph(filteredData, "Exp Type", cityName)
            })
        
        // Add title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", mapWidth / 2)
            .attr("y", (mapHeight / 2) - (imageHeight / 2) - 20)
            .attr("text-anchor", "middle")
            .text("Click a city to see more detail")
            .style("font-size", "20px")
            .style("font-family", "Helvetica")
        
        // Add tooltip
        svg.append("text")
            .attr("id", "Tooltip")
            .text("Test")
            .style("font-size", "14px")
            .style("font-family", "Helvetica")
    })
}

// Reset map after zoom
function restoreMap() {
    // Remove elements
    d3.selectAll("#backText").remove()
    d3.selectAll("#backRect").remove()
    d3.selectAll(".glyph")
        .transition()
        .duration(200).style("opacity", 0)
        .transition()
        .delay(200)
        .remove()
    d3.selectAll(".radio")
        .transition()
        .duration(200).style("opacity", 0)
        .transition()
        .delay(200)
        .remove()

    // Resize map
    zoomed = false
    imageSize.width /= 2
    imageSize.height /= 2
    d3.select("image")
        .transition()
        .duration(1000)
        .attr("x", 0)
        .attr("y", centerY)
        .attr("width", imageSize.width)
        .attr("height", imageSize.height)
        .attr("opacity", 1)
    
    // Restore chart elements
    d3.select(".chart-title")
        .transition()
        .duration(1000)
        .style("opacity", 1)
    d3.selectAll(".cityCircle")
        .transition()
        .delay(800)
        .duration(200)
        .style("opacity", 1)
        .attr("pointer-events", "auto")
}

// Generate glyph
function generateGlyph(data, category, city) {

    // Get data for category
    let subset = data.filter((d) => d.City.split(",")[0] === city)
    // Find sum for each subtype
    let categories = new Object()
    subset.forEach((d) => {
        if (categories[d[category]] === undefined) {
            categories[d[category]] = 0
        }
        categories[d[category]] += parseInt(d.Amount)
    })
    let vals = Object.keys(categories)
    let categoryData = vals.map((c) => {return {val: c, amount: categories[c]}})

    // Create coxcomb-style glyph
    let glyphColours = d3.scaleOrdinal()
        .domain(vals)
        .range(d3.schemeDark2)
    
    let radiusScale = d3.scaleLinear()
        .domain([0, d3.max(categoryData, (d) => d.amount)])
        .range([0, maxRad])
    
    let pie = d3.pie()
        .value((d) => d.amount)
    let path = d3.arc()
        .outerRadius((d) => radiusScale(d.data.amount))
        .innerRadius(20)
    let label = d3.arc()
        .outerRadius(maxRad)
        .innerRadius(maxRad)

    let glyph = svg.append("g")
        .attr("class", "glyph")
        .attr("transform", `translate(${mapWidth / 2},${mapHeight / 2})`)
        .selectAll(".arc")
        .data(pie(categoryData))
        .enter()
    
    glyph.append("path")
        .transition()
        .delay(800)
        .duration(200)
        .attr("d", path)
        .attr("class", "arc")
        .attr("fill", (d) => glyphColours(d))
        .attr("fill-opacity", 0.5)
        .attr("stroke", (d) => glyphColours(d))
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        
    glyph.append("text")
        .transition()
        .delay(800)
        .duration(200)
        .text((d) => d.data.val)
        .attr("class", "label")
        .attr("x", (d) => label.centroid(d)[0])
        .attr("y", (d) => label.centroid(d)[1])
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-family", "Helvetica")

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

d3.csv("data/top_10_cities_transactions.csv").then(data => {

    // TEST DATA: REPLACE WITH REAL WHEN READY
    var spiderCumulative = new Object()
    data.forEach((d) => {
        let cityName = d.City.split(',')[0]
        let spend = parseInt(d.Amount)
        if (spiderCumulative[cityName] === undefined) {
            spiderCumulative[cityName] = {total: 0, female: 0, entertainment: 0, grocery: 0, silver: 0}
        }
        spiderCumulative[cityName].total += spend
        if (d.Gender === "F") {
            spiderCumulative[cityName].female += spend
        }
        if (d["Exp Type"] === "Entertainment") {
            spiderCumulative[cityName].entertainment += spend
        }
        if (d["Exp Type"] === "Grocery") {
            spiderCumulative[cityName].grocery += spend
        }
        if (d["Card Type"] === "Silver") {
            spiderCumulative[cityName].silver += spend
        }
    })
    var cities = Object.keys(spiderCumulative)
    var allSpend = cities.reduce((partial, c) => partial + spiderCumulative[c].total, 0)
    var spiderData = cities.map((c) => {return {
        name: c, 
        "Total spending": spiderCumulative[c].total / allSpend,
        "Female spending": spiderCumulative[c].female / spiderCumulative[c].total, 
        "Entertainment spending": spiderCumulative[c].entertainment / spiderCumulative[c].total, 
        "Grocery spending": spiderCumulative[c].grocery / spiderCumulative[c].total, 
        "Silver card spending": spiderCumulative[c].silver / spiderCumulative[c].total}})
    console.log(spiderData)

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
            coords.push({x: (spiderWidth / 2) + xLen, y: (spiderHeight / 2) - yLen})
        })
        let start = coords[0]
        coords.push(start)
        return {name: d.name, path: coords}
    })
    spiderSvg.selectAll("path")
        .data(paths)
        .enter()
        .append("path")
            .attr("id", (d) => d.name.replace(/\s+/g, ''))
            .datum((d) => d.path)
            .attr("d", d3.line().x((d) => d.x).y((d) => d.y))
            .attr("stroke-width", 3)
            .attr("stroke", (d) => spiderColours(d))
            .attr("fill", (d) => spiderColours(d))
            .attr("stroke-opacity", 0)
            .attr("fill-opacity", 0)

    // Add title
    spiderSvg.append("text")
        .attr("class", "chart-title")
        .attr("x", spiderWidth / 2)
        .attr("y", (spiderHeight / 2) - spiderRad - 50)
        .attr("text-anchor", "middle")
        .text("Compare spending between cities by checking the boxes:")
        .style("font-size", "20px")
        .style("font-family", "Helvetica")

    // Add legend with checkboxes
    spiderSvg.selectAll("mycheckboxes")
        .data(cities)
        .enter()
        .append("rect")
            .attr("x", (_,i) => 5 + ((spiderWidth / 4) * (i % 4)))  // Lines of 4
            .attr("y", (_,i) => 5 + (spiderHeight / 2) + spiderRad + (25 * Math.floor(i / 4)))  // Start right below the spider
            .attr("width", 20)
            .attr("height", 20)
            .attr("selected", 0)
            .attr("name", (d) => d)
            .style("fill", (d) => spiderColours(d))
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill-opacity", 0)
            .on("mouseover", function(d) {
                let thisObj = d3.select(this)
                if (thisObj.attr("selected") === "0") {
                    thisObj.transition()
                        .duration(100)
                        .style("fill-opacity", 0.5)
                }
            })
            .on("mouseout", function(d) {
                let thisObj = d3.select(this)
                if (thisObj.attr("selected") === "0") {
                    thisObj.transition()
                        .duration(100)
                        .style("fill-opacity", 0)
                }
            })
            .on("click", function(d) {
                let thisObj = d3.select(this)
                let relativePath = d3.selectAll("#" + thisObj.attr("name").replace(/\s+/g, ''))
                console.log("#" + thisObj.attr("name"))
                console.log(relativePath)
                if (thisObj.attr("selected") === "0") {
                    thisObj.transition()
                        .duration(100)
                        .style("fill-opacity", 1)
                        .attr("selected", 1)
                    relativePath.transition()
                        .duration(100)
                        .style("stroke-opacity", 1)
                        .style("fill-opacity", 0.5)
                } else {
                    thisObj.transition()
                        .duration(100)
                        .style("fill-opacity", 0)
                        .attr("selected", 0)
                    relativePath.transition()
                        .duration(100)
                        .style("stroke-opacity", 0)
                        .style("fill-opacity", 0)
                }
            })

    spiderSvg.selectAll("checkboxlabels")
        .data(cities)
        .enter()
        .append("text")
            .attr("x", (_,i) => 30 + ((spiderWidth / 4) * (i % 4)))
            .attr("y", (_,i) => 20 + (spiderHeight / 2) + spiderRad + (25 * Math.floor(i / 4)))
            .text((d) => d)
            .style("font-size", "14px")
            .style("font-family", "Helvetica")
})

// Update image position and size on window resize
window.addEventListener("resize", function() {
    // Update SVG viewBox attribute
    svg.attr("viewBox", "0 0 " + ((window.innerWidth / 2) - 20) + " " + window.innerHeight);
    updateImage();
});
