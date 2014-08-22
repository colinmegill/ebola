
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
    .orient("left")
    .tickFormat(function (d) {
        return y.tickFormat(10,d3.format(",d"))(d)
	});

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
      .attr("class", "yaxis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
}


function addCasesLine (data) {

	svg.append("path")
		.datum(logFit(data))
		.attr("class", "casesline")
		.attr("d", casesLine); 

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

	svg.append("path")
		.datum(logFit(data))
		.attr("class", "deathline")
		.attr("d", deathLine); 
   
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
  addDeathLine(data);

	d3.select("#log")
        .on("click", function(d,i) {
            switchToLog(data);
		})  
		
	d3.select("#linear")
        .on("click", function(d,i) {
            switchToLinear(data);
		})  		

};

function switchToLog(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y = d3.scale.log()
    .range([height, 0])
    .domain([50, max]);	
    		
	svg.selectAll(".casesline").datum(logFit(data))
		.transition().duration(1000)
		.attr("d", casesLine);		
		
	svg.selectAll(".deathline").datum(logFit(data))
		.transition().duration(1000)
		.attr("d", deathLine);				

	svg.selectAll(".cases").data(data)
    	.transition().duration(1000)
    	.attr("cy", function(d) { return y(d.cases); });
    	
	svg.selectAll(".deaths").data(data)
    	.transition().duration(1000)
    	.attr("cy", function(d) { return y(d.deaths); });    	

	svg.selectAll(".yaxis")
		.transition().duration(1000)
		.call(yAxis.scale(y));
		
	svg.selectAll(".textCases")
		.transition().duration(1000)
		.attr("y", "40%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "45%");				
		
};

function switchToLinear(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y = d3.scale.linear()
    	.range([height, 0])
    	.domain([1, max]);
    	
	svg.selectAll(".casesline").datum(logFit(data))
		.transition().duration(1000)
		.attr("d", casesLine);	
		
	svg.selectAll(".deathline").datum(logFit(data))
		.transition().duration(1000)
		.attr("d", deathLine);				    	

	svg.selectAll(".cases").data(data)
    	.transition().duration(1000)
    	.attr("cy", function(d) { return y(d.cases); });
    	
	svg.selectAll(".deaths").data(data)
    	.transition().duration(1000)
    	.attr("cy", function(d) { return y(d.deaths); });    	

	svg.selectAll(".yaxis")
		.transition().duration(1000)
		.call(yAxis.scale(y));
		
	svg.selectAll(".textCases")
		.transition().duration(1000)
		.attr("y", "70%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "75%");				
		
};

function logFit(data) {
  var casesForFit = data.map(function(d) {
      return [d.date.valueOf(), Math.log(d.cases)];
      });
  cases_regression_line = ss.linear_regression().data(casesForFit).line();
  var deathsForFit = data.map(function(d) {
      return [d.date.valueOf(), Math.log(d.deaths)];
      });
  deaths_regression_line = ss.linear_regression().data(deathsForFit).line();  
  var fitted = data.map(function(d) {
      return {date: d.date, cases: Math.exp(cases_regression_line(d.date.valueOf())), deaths: Math.exp(deaths_regression_line(d.date.valueOf()))};
      });
  return fitted;
}


d3.json("/ebola", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  visualize(data);
  console.log(data)
});
