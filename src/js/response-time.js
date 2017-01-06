require("./lib/social"); //Do not delete
var d3 = require('d3');

// colors for bubble graph
var margin = {
  top: 15,
  right: 15,
  bottom: 50,
  left: 80
};
var colors = {
  'emergency': '#D13D59',
  'nonemergency': '#6C85A5',
  'fallback': 'red'
}
var bar_spacing = 20;

// parse the date / time
var parseMonth = d3.timeParse("%B");
// console.log(parseMonth("01"));

if (screen.width > 768){//768) {
  console.log("everything else");
  var margin = {
    top: 15,
    right: 15,
    bottom: 40,
    left: 80
  };
  var width = 650 - margin.left - margin.right;
  var height = 250 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  console.log("ipad");
  var margin = {
    top: 15,
    right: 15,
    bottom: 40,
    left: 60
  };
  var width = 650 - margin.left - margin.right;
  var height = 250 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 15,
    right: 10,
    bottom: 30,
    left: 30
  };
  var width = 360 - margin.left - margin.right;
  var height = 200 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 15,
    right: 10,
    bottom: 30,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 200 - margin.top - margin.bottom;
}

// fills in HTML for year as years toggle
var updateInfo = function(year) {
  document.querySelector(".info").innerHTML = `<strong>${year}</strong>`;
};

var years = [2011, 2012, 2013, 2014, 2015, 2016];
// var keys = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// var keys = ["Emergency","NonEmergency"];
var i = 0;

var loop = null;
var tickTime = function() {
  drawBars(years[i]);
  updateInfo(years[i]);
  i = (i + 1) % years.length;
  loop = setTimeout(tickTime, i == 0 ? 6000 : 4000);
  // loop = setTimeout(tick, i == 0 ? 1700 : 1000);
};

tickTime();

var svgEmerg, svgNonEmerg, x, yemerg, ynonemerg;
// var	valueline = d3.line()
// 	.x(function(d) { return x(parseMonth(d.Month)); })
// 	.y(function(d) { return y(d.value); });

function drawBars(selectedYear) {

  var barData = responseTimeData.filter(function(data) { return data.Year == selectedYear });
  var barDataEmergency = barData.slice();
  var barDataNonEmergency = barData.slice();

  if (selectedYear == 2011) {
	   d3.select("#response-time-emergency").select("svg").remove();
     d3.select("#response-time-nonemergency").select("svg").remove();

     svgEmerg = d3.select("#response-time-emergency").append('svg')
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     svgNonEmerg = d3.select("#response-time-nonemergency").append('svg')
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //  x = d3.scaleTime().range([0, width]);
     x = d3.scaleBand().rangeRound([0, width]).padding(0.02);
     yemerg = d3.scaleLinear().rangeRound([height, 0]);
     ynonemerg = d3.scaleLinear().rangeRound([height, 0]);

     // x-axis scale
    //  x.domain(d3.extent([parseMonth("January"),parseMonth("December")]));//.nice();
     x.domain(barDataEmergency.map(function(d) { return d.Month; }));
     yemerg.domain([0, 40]);
     ynonemerg.domain([0, 100]);

     // Add the X Axis
     ["svgEmerg","svgNonEmerg"].forEach(function(d){
        eval(d).append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x))
          // .tickFormat(d3.timeFormat("%b")))
        //  .append("text")
        //  .attr("class", "label")
        //  .attr("x", width-10)
        //  .attr("y", 50)
        //  .style("text-anchor", "end")
        //  .style("fill","black")
        //  .text("Month");
    });

   if (screen.width <= 480) {
     // Add the Y Axis
     svgEmerg.append("g")
         .call(d3.axisLeft(yemerg))
         .append("text")
         .attr("class", "label")
         .attr("transform", "rotate(-90)")
         .attr("y", 0)
         .attr("x", -10)
         .attr("dy", "20px")
         .style("text-anchor", "end")
         .style("fill","black")
         .text("Seconds");
      // Add the Y Axis
      svgNonEmerg.append("g")
          .call(d3.axisLeft(ynonemerg))
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", -10)
          .attr("dy", "20px")
          .style("text-anchor", "end")
          .style("fill","black")
          .text("Seconds");
   } else {
     // Add the Y Axis
     svgEmerg.append("g")
         .call(d3.axisLeft(yemerg))
         .append("text")
         .attr("class", "label")
         .attr("transform", "rotate(-90)")
         .attr("y", -70)
         .attr("x", -10)
         .attr("dy", "20px")
         .style("text-anchor", "end")
         .style("fill","black")
         .text("Seconds");
      // Add the Y Axis
      svgNonEmerg.append("g")
          .call(d3.axisLeft(ynonemerg))
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", -70)
          .attr("x", -10)
          .attr("dy", "20px")
          .style("text-anchor", "end")
          .style("fill","black")
          .text("Seconds");
   }
  }
  barDataEmergency.forEach(function(d) {
      d.date = d.Month;
      d.value = +(d.Emergency);
  });
  svgEmerg.selectAll("bar")
      .data(barDataEmergency)
    .enter().append("rect")
      .style("fill", colors["emergency"])
      .attr("x", function(d) { return x(d.Month); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return yemerg(d.value); })
      .attr("height", 0)
      // .attr("opacity",0.2)
      .attr("opacity",function(d,i) {
        return 0.3;//(0.15*(d.Year- +2010));
      })
      .transition()
      .duration(200)
      .delay(function (d, i) {
        return i * 200;
      })
      .attr("height", function(d) { return height - yemerg(d.value); });

  barDataNonEmergency.forEach(function(d) {
      d.date = d.Month;
      d.value = +(d.NonEmergency);
  });
  svgNonEmerg.selectAll("bar")
      .data(barDataNonEmergency)
    .enter().append("rect")
      .style("fill", colors["nonemergency"])
      .attr("x", function(d) { return x(d.Month); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return ynonemerg(d.value); })
      .attr("height", 0)
      // .attr("opacity",0.2)
      .attr("opacity",function(d,i) {
        return 0.3;//(0.15*(d.Year- +2010));
      })
      .transition()
      .duration(200)
      .delay(function (d, i) {
        return i * 200;
      })
      .attr("height", function(d) { return height - ynonemerg(d.value); });

}
