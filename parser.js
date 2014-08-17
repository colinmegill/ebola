var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var path = require("path"),
    express = require("express");

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
		dataset["day_"+i] = {
			date: d.text(),
			cases: a.text()
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
	})
	var splitNumbers = _.each(removeWords, function(entry){
		entry.cases = entry.cases.split(" ")
	})
	var sum = _.each(splitNumbers, function(entry){
		var s = 0;
		entry.cases.forEach(function(d){
			s += +d
		})
		entry.cases = s;
	})
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

