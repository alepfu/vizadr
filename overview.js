
// tooltips
var tooltip = d3.select("body").append("div").attr("class", "tooltipBars").style("opacity", 0);


// draw barchart
d3.csv("overview.csv", function(error, data) {
	
	var barHeight = 25; 			// height of one bar
	var barLabelWidth = 300;		// space reserved for bar labels
	var barLabelPadding = 10; 		// padding between bar and bar labels (left)
	var gridLabelHeight = 20; 		// space reserved for gridline labels
	var gridChartOffset = 10; 		// space between start of grid and first bar
	var maxBarWidth = 300; 			// width of the bar with the max value
	 
	// accessor functions 
	var barLabel = function(d) { return d['soc']; };
	var barValue = function(d) { return parseFloat(d['count']); };
	 
	// scales
	var yScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeBands([0, data.length * barHeight]);
	var y = function(d, i) { return yScale(i); };
	var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
	var x = d3.scale.linear().domain([0, d3.max(data, barValue)]).range([0, maxBarWidth]);
	
	// set canvas
	var chart = d3.select('#chart').append("svg")
	  .attr('width', maxBarWidth + barLabelWidth)
	  .attr('height', gridLabelHeight + gridChartOffset + data.length * barHeight);
	
	// grid line labels 
	var gridContainer = chart.append('g')
	  .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 
	gridContainer.selectAll("text").data(x.ticks(5)).enter().append("text")
	  .attr("x", x)
	  .attr("dy", -3)
	  .attr("text-anchor", "middle")
	  .text(function(d) { return d != "0" ? d + "k" : ""; });
	
	// vertical grid lines 
	gridContainer.selectAll("line").data(x.ticks(5)).enter().append("line")
	  .attr("x1", x)
	  .attr("x2", x)
	  .attr("y1", 0)
	  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
	  .style("stroke", function(d) { return d == "0" ? "#fff" : "#ccc"; });
	
	// bar labels 
	var labelsContainer = chart.append('g').attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
	labelsContainer.selectAll('text').data(data).enter()
	.append('text')
	  .attr('y', yText)
	  .attr('stroke', 'none')
	  .attr('fill', 'black')
	  .attr("dy", ".35em") 
	  .attr('text-anchor', 'end')
	  .attr("font-size", "12px")
	  .attr("style","cursor: pointer;")
	  .text(barLabel)
	  .on("click", function(d) { window.open("master.html?soc=" + d.soc, "_self"); });
	
	// bars
	var barsContainer = chart.append('g').attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
	barsContainer.selectAll("rect").data(data).enter()
	.append("rect")
	  .attr('y', y)
	  .attr('height', yScale.rangeBand() - 1)
	  .attr('width', function(d) { return x(barValue(d)); })
	  .attr('stroke', 'white')
	  .attr('fill', 'steelblue')
	  .attr("style","cursor: pointer;")
	  .on("click", function(d) { window.open("master.html?soc=" + d.soc, "_self"); })
	  .on("mouseover", function(d) {      
            
            // show tooltip
            tooltip.transition().duration(200).style("opacity", 1);      
            tooltip.html(d['count'] + "k reports<br><br>Drug-Reactions distribution")
				.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px"); 
            
            // show histogram
            drawHistogram(d.soc); 
            
            // append top 5 drugs
            drawTopFiveDrugs(d.soc);
            
            })                 
      .on("mouseout", function(d) { 
		    
		    // remove toolip
		    tooltip.transition().duration(200) .style("opacity", 0); 
		    
		    // remove histogram and top5
		    d3.select(".tooltipBars").selectAll("svg").remove(); 
		    		
		    });
		
});


// draw histogram
function drawHistogram(soc)
{
	d3.csv("data/histo/" + soc + ".csv", function(error, file) {
		var values = file.map(function(d) { return +d["countreact"] ; });
		var margin = {top: 10, right: 30, bottom: 30, left: 10}, width = 300 - margin.left - margin.right, height = 150 - margin.top - margin.bottom;
		var x = d3.scale.linear().domain([0, 200]).range([0, width]);
		var data = d3.layout.histogram().bins(x.ticks(10))(values);
		var y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.y; })]).range([height, 0]);
		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var svg = d3.select(".tooltipBars").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var bar = svg.selectAll(".bar")
			.data(data)
			.enter().append("g")
			.attr("class", "bar")
			.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

		bar.append("rect")
			.attr("x", 1)
			.attr("width", x(data[0].dx) - 2)
			.style("fill", "MediumSeaGreen")
			.attr("height", function(d) { return height - y(d.y); });

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.style("font", "9px Arial")
			.call(xAxis)
			.append("text")
				.attr("x", 265)      
				.attr("y", 22)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("No of reactions");
	});
}


// get top 5 drugs
function drawTopFiveDrugs(soc)
{
	d3.csv("data/" + soc + ".csv", function(error, file) {
		var drugs = file.map(function(d) { return [ d["drug"], +d["count"]] ; });
		drugs.sort(function(a,b) { return parseInt(b[1],10) - parseInt(a[1],10); });
		//drugs = drugs.slice(0,50);  // performance
		var names = d3.set(drugs.map(function(d) { return d[0]; })).values();
		names = names.slice(0,5);
	
		var svg = d3.select(".tooltipBars").append("svg")
			.attr("width", 250)
			.attr("height", 100)
			.append("g")
			.attr("transform", "translate(" + 10 + "," + 10 + ")");
		
		svg.append("text").text("Top 5 drugs").attr("x", -10).attr("y", 5).style("text-anchor", "begin").style("font", "14px Arial");	
		svg.append("text").text(short(names[0])).attr("x", 5).attr("y", 26).style("text-anchor", "begin").style("font", "11px Arial");	
		svg.append("text").text(short(names[1])).attr("x", 5).attr("y", 40).style("text-anchor", "begin").style("font", "11px Arial");	
		svg.append("text").text(short(names[2])).attr("x", 5).attr("y", 55).style("text-anchor", "begin").style("font", "11px Arial");
		svg.append("text").text(short(names[3])).attr("x", 5).attr("y", 70).style("text-anchor", "begin").style("font", "11px Arial");	
		svg.append("text").text(short(names[4])).attr("x", 5).attr("y", 85).style("text-anchor", "begin").style("font", "11px Arial");		
	});
}

function short(name)
{
	return name.substr(0, xIndexOf(" ", name, 4));
}

function xIndexOf(Val, Str, x)  
{  
   if (x <= (Str.split(Val).length - 1)) {  
     Ot = Str.indexOf(Val);  
     if (x > 1) { for (var i = 1; i < x; i++) { var Ot = Str.indexOf(Val, Ot + 1) } }  
     return Ot;  
   }
}  




