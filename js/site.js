
var margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%B %e").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var casesLine = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.cases); });

var deathLine = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.deaths); });

var svg = d3.select(".Chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "0 0 960 500")
    .attr("preserveAspectRatio", "xMidYMid")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
  .attr("x", 50)
  .attr("y", "75%")
  .text("Deaths")
  .attr("class", "textDeath")

svg.append("text")
  .attr("x", 50)
  .attr("y", "70%")
  .text("Cases")
  .attr("class", "textCases")

function addAxis (data) {

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain(d3.extent(data, function(d) { return d.cases; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
}


function addCasesLine (data) {

    svg.selectAll(".cases")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "cases")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.cases); });
}

function addDeathLine (data) {   
   
    svg.selectAll(".deaths")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "deaths")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.deaths); });      

}


function visualize (data) {

   data = _.each(data, function(d){
    d.date = parseDate(d.date);
  })

  addAxis(data);
  addCasesLine(data);
  addDeathLine(data)

};


function expFit(xys) {
  var xys_ = _.map(data, function(xy) {
      return [xy[0], Math.log(xy[1])]
      });
  var linFit = ss.linear_regression().data(xys_);
  var expFun = function(x) {
    return Math.exp(linFit.m() * x + linFit.b());
  };
  return expFun;
}


function fitData(data, variable) {
  var forFit = _.map(data, function(d) {
      return [d.date.vlaueOf(), d[variable]];
      });
  return expFit(forFit);
}


d3.json("/ebola", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  visualize(data);
  console.log(data)
});
