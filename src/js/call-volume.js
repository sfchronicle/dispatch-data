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
  'nonemergency': '#6C85A5',
  'fallback': 'red'
}
var bar_spacing = 20;

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

var years = [2011, 2012, 2013, 2014, 2015, 2016];
// var keys = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var keys = ["Emergency","NonEmergency"];
var i = 0;

var loop = null;
var tick = function() {
  drawBars(years[i]);
  updateInfo(years[i]);
  i = (i + 1) % years.length;
  loop = setTimeout(tick, i == 0 ? 10000 : 5000);
  // loop = setTimeout(tick, i == 0 ? 1700 : 1000);
};

tick();

// updateInfo(2011);
// drawBars(2011);

var svg, x, y;

var	valueline = d3.line()
	.x(function(d) { return x(d.Month); })
	.y(function(d) { return y(d.value); });

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

  if (selectedYear == 2011) {
	   d3.select("#call-volume-graph").select("svg").remove();

     svg = d3.select("#call-volume-graph").append('svg')
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     x = d3.scaleBand().rangeRound([0, width]).padding(0.02);
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
  }

  // define the area
  var area = d3.area()
      .x(function(d) { return x(d.Month); })
      .y0(height)
      .y1(function(d) { return y(d.value); });

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d.Month); })
      .y(function(d) { return y(d.value); });

  // add the area
  svg.append("path")
     .data([barData])
     .attr("class", "area")
     .attr("fill",colors[data_toggle])
    //  .attr("stroke-width",function(d){return String((1+d.Year- +2010)+"px");})
     .attr("d", area);

  // add the valueline path
  var path = svg.append("path")
      .data([barData])
      .attr("class", "line")
      .attr("d", valueline)
      .attr("stroke",colors[data_toggle])
      .transition()
          .duration(200*12)
          .attrTween('d', pathTween);

  // var totalLength = path.node().getTotalLength();
  //
  // path
  //   .attr("stroke-dasharray", totalLength + " " + totalLength)
  //   .attr("stroke-dashoffset", totalLength)
  //   .transition()
  //     .duration(2000)
  //     .ease("linear")
  //     .attr("stroke-dashoffset", 0);

  function pathTween() {
    var interpolate = d3.scaleQuantile()
      .domain([0,1])
      .range(d3.range(1, barData.length + 1));
    return function(t) {
      return valueline(barData.slice(0, interpolate(t)));
    };
  }

  // // Add the valueline path.
  // svg.append("path")
  //     .data([barData])
  //     .attr("class", "line")
  //     .attr("d", valueline)
  //     .attr("fill",colors["emergency"])
  //     .attr("stroke-width",0);

  // svg.selectAll("bar")
  //     .data(barData)
  //   .enter().append("rect")
  //     .style("fill", colors["emergency"])
  //     .attr("x", function(d) { return x(d.Month); })
  //     .attr("width", x.bandwidth())
  //     .attr("y", function(d) { return y(d.value); })
  //     .attr("height", 0)
  //     // .attr("opacity",0.2)
  //     .attr("opacity",function(d,i) {
  //       console.log(d);
  //       return 0.3;//(0.15*(d.Year- +2010));
  //     })
  //     .transition()
  //     .duration(200)
  //     .delay(function (d, i) {
  //       return i * 200;
  //     })
  //     .attr("height", function(d) { return height - y(d.value); });

}
