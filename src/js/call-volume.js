require("./lib/social"); //Do not delete
var d3 = require('d3');

// colors for bubble graph
var colors = {
  'emergency': '#D13D59',
  'nonemergency': '#6C85A5',
  'fallback': 'red'
}
// var bar_spacing = 20;

// toggle for the data file
var data_toggle = "emergency";

// event listeners for the buttons
document.querySelector('#emerg-button').addEventListener('click', function(){
  document.querySelector("#nonemerg-button").classList.remove("selected");
  this.classList.add("selected");
  data_toggle = "emergency";
  clearTimeout(loop);
  i = 0;
  tick();
});
document.querySelector('#nonemerg-button').addEventListener('click', function(){
  document.querySelector("#emerg-button").classList.remove("selected");
  this.classList.add("selected");
  data_toggle = "nonemergency";
  clearTimeout(loop);
  i = 0;
  tick();
});

// parse the date / time
var parseMonth = d3.timeParse("%B");
// console.log(parseMonth("01"));

if (screen.width > 768){//768) {
  console.log("everything else");
  var margin = {
    top: 15,
    right: 35,
    bottom: 40,
    left: 80
  };
  var width = 800 - margin.left - margin.right;
  var height = 450 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  console.log("ipad");
  var margin = {
    top: 15,
    right: 35,
    bottom: 40,
    left: 60
  };
  var width = 720 - margin.left - margin.right;
  var height = 450 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 15,
    right: 40,
    bottom: 35,
    left: 30
  };
  var width = 360 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 15,
    right: 45,
    bottom: 35,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
}

// fills in HTML for year as years toggle
var updateInfo = function(year) {
  document.querySelector(".info").innerHTML = `<strong>${year}</strong>`;
};

var years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
// var keys = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// var keys = ["Emergency","NonEmergency"];
var i = 0;

var loop = null;
var tick = function() {
  drawBars(years[i]);
  updateInfo(years[i]);
  i = (i + 1) % years.length;
  loop = setTimeout(tick, i == 0 ? 4000 : 3000);
  // loop = setTimeout(tick, i == 0 ? 1700 : 1000);
};

tick();

var svg, x, y;

function drawBars(selectedYear) {

  var barData = callVolumeData.filter(function(data) { return data.Year == selectedYear });
  barData.forEach(function(d) {
      d.date = parseMonth(d.Month);
      if (data_toggle == "emergency") {
        d.value = +(d.Emergency/1000);
      } else {
        d.value = +(d.NonEmergency/1000);
      }
  });

  if (selectedYear == 2007) {
	   d3.select("#call-volume-graph").select("svg").remove();

     svg = d3.select("#call-volume-graph").append('svg')
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     x = d3.scaleTime().range([0, width]);
     y = d3.scaleLinear().rangeRound([height, 0]);

     // x-axis scale
     x.domain(d3.extent([parseMonth("January"),parseMonth("December")]));//.nice();
     if (screen.width <= 480) {
       y.domain([0, 70]);
     } else {
       y.domain([0, 60]);
     }

     // Add the X Axis
     if (screen.width <=480) {
       var yval = 40;
       svg.append("g")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b")))
            .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)" );
     } else {
       var yval = 50;
       svg.append("g")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b")))
     }

        //  .append("text")
        //  .attr("class", "label")
        //  .attr("x", width-10)
        //  .attr("y", yval)
        //  .style("text-anchor", "end")
        //  .style("fill","black")
        //  .text("Month");

     if (screen.width <= 480) {
       // Add the Y Axis
       svg.append("g")
           .call(d3.axisLeft(y))
           .append("text")
           .attr("class", "label")
           .attr("transform", "rotate(-90)")
           .attr("y", 0)
           .attr("x", 10)
           .attr("dy", "20px")
           .style("text-anchor", "end")
           .style("fill","black")
           .text("# of calls (K)");
     } else {
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
           .text("Number of calls (K)");
    }
  }

  // define the area
  var area = d3.area()
      .x(function(d) { return x(parseMonth(d.Month)); })
      .y0(height)
      .y1(function(d) { return y(d.value); });

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(parseMonth(d.Month)); })
      .y(function(d) { return y(d.value); });

  // add the area
  svg.append("path")
     .data([barData])
     .attr("class", "area")
     .attr("fill",colors[data_toggle])
     .transition()
         .duration(200*12)
         .attrTween('d', areaTween);

  // add the valueline path
  var path = svg.append("path")
      .data([barData])
      .attr("class", "line")
      .attr("stroke",colors[data_toggle])
      .transition()
          .duration(200*12)
          .attrTween('d', pathTween);

  function pathTween() {
    var interpolate = d3.scaleQuantile()
      .domain([0,1])
      .range(d3.range(1, barData.length + 1));
    return function(t) {
      return valueline(barData.slice(0, interpolate(t)));
    };
  }
  function areaTween() {
    var interpolate = d3.scaleQuantile()
      .domain([0,1])
      .range(d3.range(1, barData.length + 1));
    return function(t) {
      return area(barData.slice(0, interpolate(t)));
    };
  }

}
