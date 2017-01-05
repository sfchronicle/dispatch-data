require("./lib/social"); //Do not delete
var d3 = require('d3');

// colors for bubble graph
var margin = {
  top: 15,
  right: 15,
  bottom: 60,
  left: 80
};
var colors = {
  'emergency': '#D13D59',
  'non-emergency': '#6C85A5',
  'fallback': 'red'
}
var bar_spacing = 20;

// parse the date / time
var parseMonth = d3.timeParse("%M");

if (screen.width > 768) {
  var width = 800 - margin.left - margin.right;
  var height = 450 - margin.top - margin.bottom;
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

// fills in HTML for year as years toggle
var updateInfo = function(year) {
  document.querySelector(".info").innerHTML = `<strong>${year}</strong>`;
};

// var years = [2011, 2012, 2013, 2014, 2015, 2016];
// // var keys = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// var keys = ["Emergency","NonEmergency"];
// var i = 0;
//
// var loop = null;
// var tick = function() {
//   drawBars(years[i]);
//   updateInfo(years[i]);
//   i = (i + 1) % years.length;
//   loop = setTimeout(tick, i == 0 ? 1700 : 1000);
// };
//
// tick();

updateInfo(2011);
drawBars(2011);

function drawBars(selectedYear) {

	d3.select("#call-volume-graph").select("svg").remove();

  var svg = d3.select("#call-volume-graph").append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var barData = callVolumeData.filter(function(data) { return data.Year == selectedYear });
  console.log(barData);
  barData.forEach(function(d) {
      d.date = parseMonth(d.Month);
      d.value = +(d.Emergency/1000);
  });
  console.log(barData);

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.5),
      y = d3.scaleLinear().rangeRound([height, 0]);

  // x-axis scale
  x.domain(barData.map(function(d) { return d.Month; }));
  y.domain([0, 60]);

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("class", "label")
      .attr("x", width-10)
      .attr("y", 50)
      .style("text-anchor", "end")
      .style("fill","black")
      .text("Month");

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


  svg.selectAll("bar")
      .data(barData)
    .enter().append("rect")
      .style("fill", colors["emergency"])
      .attr("x", function(d) { return x(d.Month); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });

}
