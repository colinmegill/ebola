var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var path = require("path"),
    express = require("express");

app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-transform,public,max-age=3600,s-maxage=3600");
    return next();
});

var app = express()
            .use(express.static(__dirname));

var port = process.env.PORT || 3000;
app.listen(port);
console.log("ebola on port " + port)

function parseSite (body) {
	var dataset = {}
  var $ = cheerio.load(body);
  $("#issues li").each(function(i, elem){
		var a = $(this).find(".cases")
		var d = $(this).find(".date")
		var b = $(this).find(".deaths")
		dataset["day_"+i] = {
			date: d.text(),
			cases: a.text(),
			deaths: b.text()
		}
  })
  return dataset;
}

function cleanup (dataset) {
	var withoutEmptyDates = _.filter(dataset, function(entry){
		return entry.date
	})
	var withoutEmptyDatesOrCases = _.filter(withoutEmptyDates, function(entry){
		return entry.cases
	})
	var removeWords = _.each(withoutEmptyDatesOrCases, function(entry){
		entry.cases = entry.cases.replace(/cases/g, "");
		entry.deaths = entry.deaths.replace(/deaths/g, "")
		entry.deaths = entry.deaths.replace(/death/g, "")

	})
	var splitNumbers = _.each(removeWords, function(entry){
		entry.cases = entry.cases.split(" ");
		entry.deaths = entry.deaths.split(" ");
	})
	var sum = _.each(splitNumbers, function(entry){
		var caseSum = 0;
		var deathSum = 0;
		entry.cases.forEach(function(d){
			caseSum += +d;
		})
		entry.deaths.forEach(function(d){
			deathSum += +d;
		})
		entry.cases = caseSum;
		entry.deaths = deathSum;
	})

	console.log(sum)
	return sum;
}

app.get('/ebola', function(req,res){
	request('http://healthmap.org/ebola/', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	var dirtyDataset = parseSite(body)
	  	var dataset = cleanup(dirtyDataset)
	  	res.json(dataset);
	  }
	})
})

