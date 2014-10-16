
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
  .attr("y", "15%")
  .text("Deaths")
  .attr("class", "textDeath")

svg.append("text")
  .attr("x", 50)
  .attr("y", "10%")
  .text("Cases")
  .attr("class", "textCases")

function addAxis (data) {

	x.domain(d3.extent(data, function(d) { return d.date; }));

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y.domain([50, max]);	  

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
	});
	
	recentData = [];
	data.forEach( function(d) {
		if ( d.date.getTime() - parseDate("May 1").getTime() > 0 ) {
			recentData.push(d);
		}
	});
	data = recentData;
	
	cumulativeData = data;
	
	var prevCases = data[0].cases,
		prevDeaths = data[0].deaths,
		prevDate = data[0].date,
		intervalData = [],
		h = {};
		h.date = prevDate;
		h.cases = 0.1;
		h.deaths = 0.1;
		intervalData.push(h);
		
	data.slice(1).forEach( function(d) {
		h = {};
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var interval = (d.date.getTime() - prevDate.getTime()) / oneDay;			
		h.date = d.date;
		h.cases = (d.cases - prevCases) / interval;
		h.deaths = (d.deaths - prevDeaths) / interval;
		prevCases = d.cases;
		prevDeaths = d.deaths;
		prevDate = d.date;
		if (h.cases == 0) {
			h.cases = 0.1;
		}
		if (h.deaths == 0) {
			h.deaths = 0.1;
		}		
		intervalData.push(h);
	});	

	addAxis(data);
	addCasesLine(data);
	addDeathLine(data);

	d3.select("#log")
        .on("click", function(d,i) {
            switchToLog(data);
			d3.select("#log").classed("selected", true);
			d3.select("#linear").classed("selected", false);
		})  
		
	d3.select("#linear")
        .on("click", function(d,i) {
            switchToLinear(data);
			d3.select("#log").classed("selected", false);            
			d3.select("#linear").classed("selected", true);
		})  
		
	d3.select("#interval")
        .on("click", function(d,i) {
        	data = intervalData;
            switchToInterval(data);
			d3.select("#interval").classed("selected", true);
			d3.select("#cumulative").classed("selected", false);			
		})  	
		
	d3.select("#cumulative")
        .on("click", function(d,i) {
        	data = cumulativeData;
            switchToCumulative(data);
			d3.select("#interval").classed("selected", false);
			d3.select("#cumulative").classed("selected", true);	
		})  						

};

function switchToLog(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y = d3.scale.log()
    	.range([height, 0])
    	.domain(y.domain());	
    		
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
		.attr("y", "10%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "15%");				
		
};

function switchToLinear(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y = d3.scale.linear()
    	.range([height, 0])
    	.domain(y.domain());
    	    	
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
		.attr("y", "10%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "15%");				
		
};

function switchToInterval(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y.domain([1, max]);	// set domain
    	
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
		.attr("y", "10%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "15%");				
		
};

function switchToCumulative(data) {

	var max = d3.max(data, function(d) {
    	return d.cases;
	});

	y.domain([50, max]);	// set domain
    	
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
		.attr("y", "10%");		
		
	svg.selectAll(".textDeath")
		.transition().duration(1000)
		.attr("y", "15%");	
		
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
