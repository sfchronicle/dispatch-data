require("./lib/social"); //Do not delete
var d3 = require('d3');

// colors for bubble graph
var margin = {
  top: 15,
  right: 15,
  bottom: 25,
  left: 80
};
var colors = {
  'emergency': '#D13D59',
  'non-emergency': '#6C85A5',
  'fallback': 'red'
}

// parse the date / time
var parseYear = d3.timeParse("%Y");

// bubble graph ---------------------------------------------------------------

if (screen.width > 768) {
  var width = 800 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 650 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
} else if (screen.width <= 480) {
  var margin = {
    top: 15,
    right: 10,
    bottom: 25,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;
}

// convert strings to numbers
bubbleData.forEach(function(d) {
  d.YearText = d.Year;
  d.Year = parseYear(d.Year);
  d.Percent = Math.round(d.Percent*1000)/10;
  d.Number = Math.round(d.Number);
  d.NumberThous = Math.round(d.Number/1000);
})

// x-axis scale
var x = d3.scaleTime()
    .range([0, width]);

// y-axis scale
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// color bands
// var color = d3.scale.ordinal()
//     .range(["#FFE599", "#DE8067"]);

// var color = d3.scale.category10();
// var color = "red";

// use x-axis scale to set x-axis
// var xAxis = d3.axisBottom(x)
//     .tickFormat(d3.time.format("%Y"));
//
// // use y-axis scale to set y-axis
// var yAxis = d3.axisLeft(y)
//     .orient("left")

// var valueline = d3.svg.line()
//   .x(function(d) {return x(d.salaryK); })
//   .y(function(d) {return y(d.salaryK/3); });

// create SVG container for chart components
var svg = d3.select(".bubble-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log(bubbleData);
x.domain(d3.extent([parseYear(2010),parseYear(2017)]));//.nice();
y.domain([40,100]); //.nice();

var xMin = x.domain()[0];
var xMax = x.domain()[1];

//color in the dots
svg.selectAll(".dot")
    .data(bubbleData)
    .enter().append("circle")
    .attr("r", function(d) {
      //return 6;
      console.log(d.Number/60000);
      if (screen.width <= 480) {
        return d.Number/50000;//(d.NumberEmerg/1400)+5;
      } else {
        return 20*(d.Number/50000-6.9)/5+1;//(d.NumberEmerg/800)+6.5;
      }
    })
    .attr("cx", function(d) { return x(d.Year); })
    .attr("cy", function(d) { return y(d.Percent); })
    .attr("opacity",0.9)
    .style("fill", function(d) {
      return color_function(d.Key) || colors.fallback;
    })
    .on("mouseover", function(d) {
        tooltip.html(`
            <div>Year: <span class='bold'>${d.YearText}</span></div>
            <div>Call type: <span class='bold'>${d.Key}</span></div>
            <div>Number of calls: <span class='bold'>${d.NumberThous}K</span></div>
            <div>% answered quickly: <span class='bold'>${d.Percent}%</span></div>
        `);
        tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      if (screen.width <= 480) {
        return tooltip
          .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
          .style("left",10+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+20)+"px")
          .style("left",(d3.event.pageX-80)+"px");
      }
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

function color_function(county) {
  var id = county.toLowerCase().split(" ").join("");
  if (colors[id]) {
    return colors[id];
  } else {
    return null;
  }
}

var node = svg.selectAll(".circle")
    .data(bubbleData)
    .enter().append("g")
    .attr("class","node");

node.append("text")
    .attr("x", function(d) { return x(d.Year) })
    .attr("y", function(d) { return y(d.Percent)+20; })
    .attr("class","node-label")
    // .style("fill","black")
    .style("font-size","13px")
    // .style("font-style","italic")
    .text(function(d) {
        return d.NumberThous+"K calls";
    });

var xMin = x.domain()[0];
var xMax = x.domain()[1];

var line80 = [
  {x: xMin, y: 80},
  {x: xMax, y: 80}
];

var line90 = [
  {x: xMin, y: 90},
  {x: xMax, y: 90}
];

// define the line
var linefunc = d3.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

var path80 = svg.append("path")
  .attr("d", linefunc(line80))
  .attr("stroke", colors["non-emergency"])
  .attr("stroke-width", "2")
  .attr("fill", "none");

svg.append("text")
    .attr("x", 4*width/5)
    .attr("y", 4*height/10-50)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Target response rate for non-emergency calls");

var path90 = svg.append("path")
  .attr("d", linefunc(line90))
  .attr("stroke", colors["emergency"])
  .attr("stroke-width", "2")
  .attr("fill", "none");

svg.append("text")
    .attr("x", 4*width/5)
    .attr("y", 2*height/10-30)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Target response rate for emergency calls");

// Add the X Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("class", "label")
    .attr("x", width-10)
    .attr("y", -10)
    .style("text-anchor", "end")
    .style("fill","black")
    .text("Year");

// Add the Y Axis
svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x", -10)
    .attr("dy", "20px")
    .style("text-anchor", "end")
    .style("fill","black")
    .text("Percent of calls within acceptable response time");

// show tooltip
var tooltip = d3.select(".bubble-graph")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
