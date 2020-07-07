// get file
var url = window.location.toString();
var selected_soc = decodeURI(url.substring(url.indexOf("=") + 1));
document.getElementById("soc").innerHTML = selected_soc;  
var selected_file = "data/" + selected_soc + ".csv";

// tooltips
var tooltip = d3.select("body").append("div").attr("class", "tooltipDots").style("opacity", 0);

// scatterplot
var countCol = 2; // default
var legnedSquareSize = 14;
var rangeValue = 50; // default
var data = [];
var sortMode = "alphabetically";
document.getElementById("sortSelect").value = sortMode;  
document.getElementById('checkGender').checked = false;
document.getElementById('checkAge').checked = false;
document.getElementById('checkSerious').checked = false;
d3.csv(selected_file, function(data) {
	data = data.map(function(d) { return [ d["drug"], d["reaction"], +d["count"], +d["countmale"], +d["countfemale"],
											+d["countdeath"], +d["countdisab"], +d["countanomal"], 
											+d["countthreat"], +d["counthosp"], +d["countother"],
											+d["countyoung"], +d["countadult"], +d["countelderly"], +d["countserious"]
										 ]; });

	//console.log(data);
	
	// slice the 100 biggest entries
	data.sort(function(a,b) { return parseInt(b[2],10) - parseInt(a[2],10); });
	data = data.slice(0,100);
	var max = parseInt(data[0][2]);
	
	// add gender differences column
	var genderDiffs = data.map(function(value,index) { return Math.abs(value[3]-value[4]); });
	var genderDiffColumnIndex = data[0].length;
	for(var i = 0; i < data.length; i++)
		data[i][data[i].length] = genderDiffs[i];
		
	// add age differences column
	var ageDiffs = data.map(function(value,index) { return getAgeDiff(parseInt(value[11]),parseInt(value[12]),parseInt(value[13])); });	
	var ageDiffColumnIndex = data[0].length;
	for(var i = 0; i < data.length; i++)
		data[i][data[i].length] = ageDiffs[i];
	
	// parse ticks	
	var drugs = d3.set(data.map(function(value,index) { return value[0]; })).values();
	var drugsUnsorted = drugs.slice(0);
	drugs.sort();
	var reactions = d3.set(data.map(function(value,index) { return value[1]; })).values();
	var reactionsUnsorted = reactions.slice(0);
	reactions.sort();


	// set bounds, domains, ranges, axes, zoom and canvas
	var margin = { top: 10, right: 10, bottom:200, left: 200 }, width = 1200 - margin.left - margin.right, height = 700 - margin.top - margin.bottom;
	var x = d3.scale.ordinal().domain(drugs).rangeBands([0, width]);
	var y = d3.scale.ordinal().domain(reactions).rangeBands([0, height]);		
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left");			
	var svg = d3.select("#scatter").append("svg")
						.attr('class', 'd3c')
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// calc non-overlapping circle scale
	var maxRadius = Math.min((width/drugs.length)/2, (height/reactions.length)/2);
	var circleScale = maxRadius/max;


	
	// draw x-axis                    
	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(xAxis)
	  .selectAll("text")
		.attr("y", 6)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(60)")
		.style("font", "11px Arial")
		.style("text-anchor", "start");
	  
	// draw y-axis
	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
	  .append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end");

	// draw circles 
	svg.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.style("fill", "green")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("opacity",0.80)	
		.attr("class", "dot")		
		.attr("r",  function(d) { return (d[countCol] * circleScale); } )
		.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
		.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); })
		.attr("cursor","pointer")
		.on("mouseover", function(d) {
			// show tooltip      
            tooltip.transition().duration(200).style("opacity", 1);      
            tooltip.html(d[1] + "<br><b>caused by</b><br>" + d[0] + "<br><br>" + d[2] + " reports" ).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px"); 
                
            // highlight lables
            var overReaction = d[1];    
            d3.selectAll("g.y.axis g.tick text").style("fill", function(d) { return d == overReaction ? "red" : "black"; } );
            var overDrug = d[0];    
            d3.selectAll("g.x.axis g.tick text").style("fill", function(d) { return d == overDrug ? "red" : "black"; } ); })                 
		.on("mouseout", function(d) {
			// hide tooltip 
			tooltip.transition().duration(500) .style("opacity", 0); 
			
			// hide highlighting
			d3.selectAll("g.y.axis g.tick text").style("fill","black");
			d3.selectAll("g.x.axis g.tick text").style("fill","black"); })
		.on("click", function(d) { window.open("detail.html?drug=" + d[0] + "&reaction=" + d[1] +
											   "&countdeath=" + d[5] + "&countdisab=" + d[6] +
											   "&countanomal=" + d[7] + "&countthreat=" + d[8] +
											   "&counthosp=" + d[9] + "&countother=" + d[10] +
											   "&countmale=" + d[3] + "&countfemale=" + d[4] +
											   "&countyoung=" + d[11] + "&countadult=" + d[12] + "&countelderly=" + d[13] + 
											   "&count=" + d[2] + "&soc=" + selected_soc + "&serious=" + Math.floor((d[14]/d[2])*100), "_self"); });
	
	// gender filter
	d3.select("button#buttonFilter").on("click", function () {
		countCol = document.getElementById('selectGender').value;
			
		// refresh circles 
		svg.selectAll(".dot").data(data)
			.attr("r",  function(d) { return (d[countCol] * circleScale); } )  
			.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
			.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
	}); 			
	
	// gender differences
	d3.select("input#checkGender").on("click", function () {	
		var x0 = d3.scale.ordinal().domain(drugsUnsorted).rangeBands([0, width]).copy();
		var y0 = d3.scale.ordinal().domain(reactionsUnsorted).rangeBands([0, height]).copy();
		
		if (document.getElementById('checkGender').checked)
		{
			// uncheck/hide age filter
			document.getElementById('checkAge').checked = false;
			document.getElementById("ageLegend").style.display = "none";
			
			// calc new circle scale
			genderDiffs.sort(function(a,b) { return b-a; });
			var genderDiffMax = genderDiffs[0];
			circleScale = maxRadius/genderDiffMax;
			
			
			sortMode = document.getElementById("sortSelect").value;
			if (sortMode == "alphabetically")  // consider sorting
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r", function(d) { return (d[genderDiffColumnIndex] * circleScale); } )  
					.style("fill", function(d) { return d[3] >= d[4] ? "steelblue" : "pink"; })
					.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
			}
			else
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r", function(d) { return (d[genderDiffColumnIndex] * circleScale); } )  
					.style("fill", function(d) { return d[3] >= d[4] ? "steelblue" : "pink"; })
					.attr("cx", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y0(d[1]) + ((height/reactions.length)/2); });
			}
				
			// show gender legends	
			document.getElementById("genderLegend").style.display = "inline";
							
		}
		else
		{
			// reset circle scale
			circleScale = maxRadius/max;
			
			sortMode = document.getElementById("sortSelect").value;
			if (sortMode == "alphabetically")  // consider sorting
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r",  function(d) { return (d[countCol] * circleScale); } ) 
					.style("fill", "green") 
					.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
			}
			else
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r",  function(d) { return (d[countCol] * circleScale); } ) 
					.style("fill", "green") 
					.attr("cx", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y0(d[1]) + ((height/reactions.length)/2); });
			}	
			
			// hide gender legends
			document.getElementById("genderLegend").style.display = "none";	
		}
	});

	// draw gender legends
	var genderLegend = d3.select("#genderLegend").append("svg").attr("width", 150).attr("height", 40).append("g");
	genderLegend.append("rect").attr("y", 0).attr("width", legnedSquareSize).attr("height", legnedSquareSize).style("fill", "steelblue");
	genderLegend.append("rect").attr("y", 20).attr("width", legnedSquareSize).attr("height", legnedSquareSize).style("fill", "pink");	
	genderLegend.append("text").attr("x", 18).attr("y", 10).style("text-anchor", "begin").text("Male");
	genderLegend.append("text").attr("x", 18).attr("y", 30).style("text-anchor", "begin").text("Female");
	
	// age differences
	d3.select("input#checkAge").on("click", function () {
		var x0 = d3.scale.ordinal().domain(drugsUnsorted).rangeBands([0, width]).copy();
		var y0 = d3.scale.ordinal().domain(reactionsUnsorted).rangeBands([0, height]).copy();
		
		if (document.getElementById('checkAge').checked)
		{			
			// uncheck/hide gender filter
			document.getElementById('checkGender').checked = false;
			document.getElementById("genderLegend").style.display = "none";
			
			// calc new circle scale
			ageDiffs.sort(function(a,b) { return b-a; });
			var ageDiffMax = ageDiffs[0];
			circleScale = maxRadius/ageDiffMax;
			
			sortMode = document.getElementById("sortSelect").value;
			if (sortMode == "alphabetically")  // consider sorting
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r", function(d) { return (d[ageDiffColumnIndex] * circleScale); } )  
					.style("fill", function(d) { return getAgeDiffColor(d[11],d[12],d[13]); })
					.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
			}
			else
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r", function(d) { return (d[ageDiffColumnIndex] * circleScale); } )  
					.style("fill", function(d) { return getAgeDiffColor(d[11],d[12],d[13]); })
					.attr("cx", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y0(d[1]) + ((height/reactions.length)/2); });	
			}
				
			// show gender legends	
			document.getElementById("ageLegend").style.display = "inline";
							
		}
		else
		{
			// reset circle scale
			circleScale = maxRadius/max;
			
			sortMode = document.getElementById("sortSelect").value;
			if (sortMode == "alphabetically")  // consider sorting
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r",  function(d) { return (d[countCol] * circleScale); } ) 
					.style("fill", "green") 
					.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
			}
			else
			{
				// refresh circles 
				svg.selectAll(".dot").data(data)
					.attr("r",  function(d) { return (d[countCol] * circleScale); } ) 
					.style("fill", "green") 
					.attr("cx", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("cy", function(d) { return y0(d[1]) + ((height/reactions.length)/2); });	
			}
				
			// hide gender legends
			document.getElementById("ageLegend").style.display = "none";	
		}
	});
	
	// draw age legends
	var ageLegend = d3.select("#ageLegend").append("svg").attr("width", 150).attr("height", 60).append("g");
	ageLegend.append("rect").attr("y", 0).attr("width", legnedSquareSize).attr("height", legnedSquareSize).style("fill", "lightgreen");
	ageLegend.append("rect").attr("y", 20).attr("width", legnedSquareSize).attr("height", legnedSquareSize).style("fill", "orange");	
	ageLegend.append("rect").attr("y", 40).attr("width", legnedSquareSize).attr("height", legnedSquareSize).style("fill", "purple");
	ageLegend.append("text").attr("x", 18).attr("y", 10).style("text-anchor", "begin").text("Young <21");
	ageLegend.append("text").attr("x", 18).attr("y", 30).style("text-anchor", "begin").text("Adult 21-65");
	ageLegend.append("text").attr("x", 18).attr("y", 50).style("text-anchor", "begin").text("Elderly >65");
	
	// show serious factor
	d3.select("input#checkSerious").on("click", function () {
		if (document.getElementById('checkSerious').checked)
		{			
			sortMode = document.getElementById("sortSelect").value;
			if (sortMode == "alphabetically")  // consider sorting
			{
				svg.selectAll(".seriousLabel")
					.data(data)
					.enter().append("text")
					.attr("class", "seriousLabel")
					.attr("x", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("y", function(d) { return y(d[1]) + ((height/reactions.length)/2); })
					.text(function(d) { return getSeriousFactorLabel(d[2],d[14]); })
					.attr("fill", "red")
					.attr("font-size", "13px")
					.attr("font-weight", "bold");
			}
			else
			{
				var x0 = d3.scale.ordinal().domain(drugsUnsorted).rangeBands([0, width]).copy();
				var y0 = d3.scale.ordinal().domain(reactionsUnsorted).rangeBands([0, height]).copy();
				
				svg.selectAll(".seriousLabel")
					.data(data)
					.enter().append("text")
					.attr("class", "seriousLabel")
					.attr("x", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("y", function(d) { return y0(d[1]) + ((height/reactions.length)/2); })
					.text(function(d) { return getSeriousFactorLabel(d[2],d[14]); })
					.attr("fill", "red")
					.attr("font-size", "13px")
					.attr("font-weight", "bold");
				
			}
			
			document.getElementById("seriousRange").style.display = "inline";
			
			// fade circles
			svg.selectAll(".dot").data(data).style("opacity",0.3);					
		}
		else
		{
			svg.selectAll(".seriousLabel").remove();
			document.getElementById("seriousRange").style.display = "none";
			
			// reset circles
			svg.selectAll(".dot").data(data).style("opacity",1);	
		}
	});
	
	// apply serious range
	d3.select("input#rangeSerious").on("change", function () {
		rangeValue = document.getElementById('rangeSerious').value;
		document.getElementById('rangeSeriousLabel').innerHTML = "&#8805;" + rangeValue;
		
		sortMode = document.getElementById("sortSelect").value;
		if (sortMode == "alphabetically")  // consider sorting
		{
			// redraw labels
			svg.selectAll(".seriousLabel").remove();
			svg.selectAll(".seriousLabel")
					.data(data)
					.enter().append("text")
					.attr("class", "seriousLabel")
					.attr("x", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
					.attr("y", function(d) { return y(d[1]) + ((height/reactions.length)/2); })
					.text(function(d) { return getSeriousFactorLabel(d[2],d[14]); })
					.attr("fill", "red")
					.attr("font-size", "13px")
					.attr("font-weight", "bold");
		}
		else 
		{
			var x0 = d3.scale.ordinal().domain(drugsUnsorted).rangeBands([0, width]).copy();
			var y0 = d3.scale.ordinal().domain(reactionsUnsorted).rangeBands([0, height]).copy();
			
			// redraw labels
			svg.selectAll(".seriousLabel").remove();
			svg.selectAll(".seriousLabel")
					.data(data)
					.enter().append("text")
					.attr("class", "seriousLabel")
					.attr("x", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
					.attr("y", function(d) { return y0(d[1]) + ((height/reactions.length)/2); })
					.text(function(d) { return getSeriousFactorLabel(d[2],d[14]); })
					.attr("fill", "red")
					.attr("font-size", "13px")
					.attr("font-weight", "bold");
		}		
	});
	
	// apply sort
	d3.select("select#sortSelect").on("change", function () {	
		sortMode = document.getElementById("sortSelect").value;
		var transition = svg.transition().duration(750);
		var delay = function(d, i) { return i * 30; };
		
		if (sortMode == "reportcount")  // order by report count
		{
			var x0 = d3.scale.ordinal().domain(drugsUnsorted).rangeBands([0, width]).copy();
			var y0 = d3.scale.ordinal().domain(reactionsUnsorted).rangeBands([0, height]).copy();
			var xAxis0 = d3.svg.axis().scale(x0).orient("bottom");
			var yAxis0 = d3.svg.axis().scale(y0).orient("left");
			transition.select(".y.axis").call(yAxis0).selectAll("g").delay(delay).selectAll("text");
			transition.select(".x.axis").call(xAxis0).selectAll("g").delay(delay).selectAll("text")
				.attr("y", 6)
				.attr("x", 9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(60)")
				.style("font", "11px Arial")
				.style("text-anchor", "start");		
			transition.selectAll(".dot").delay(delay)
				.attr("cx", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
				.attr("cy", function(d) { return y0(d[1]) + ((height/reactions.length)/2); });
				
			// serious lables
			transition.selectAll(".seriousLabel").delay(delay)	
				.attr("x", function(d) { return x0(d[0]) + ((width/drugs.length)/2); })
				.attr("y", function(d) { return y0(d[1]) + ((height/reactions.length)/2); })
				
		}
		else  // set back to alphabetical order
		{
			transition.select(".y.axis").call(yAxis).selectAll("g").delay(delay).selectAll("text");
			transition.select(".x.axis").call(xAxis).selectAll("g").delay(delay).selectAll("text")
				.attr("y", 6)
				.attr("x", 9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(60)")
				.style("font", "11px Arial")
				.style("text-anchor", "start");		
			transition.selectAll(".dot").delay(delay)
				.attr("cx", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
				.attr("cy", function(d) { return y(d[1]) + ((height/reactions.length)/2); });
			
			// serious lables
			transition.selectAll(".seriousLabel").delay(delay)	
				.attr("x", function(d) { return x(d[0]) + ((width/drugs.length)/2); })
				.attr("y", function(d) { return y(d[1]) + ((height/reactions.length)/2); })
		}
	});
	
	
	
   
});

function getAgeDiff(young, adult, elderly)
{
	var maxAgeGroup = Math.max(young, adult, elderly);
	if (maxAgeGroup == young)
		return (young-adult)+(young-elderly);
	if (maxAgeGroup == adult)
		return (adult-young)+(adult-elderly);
	if (maxAgeGroup == elderly)
		return (elderly-adult)+(elderly-young);		
}

function getAgeDiffColor(young, adult, elderly)
{
	var maxAgeGroup = Math.max(young, adult, elderly);
	if (maxAgeGroup == young)
		return "lightgreen";
	if (maxAgeGroup == adult)
		return "orange";
	if (maxAgeGroup == elderly)
		return "purple";		
}

function getSeriousFactorLabel(count,countserious)
{
	var factor = Math.floor((countserious/count)*100);
	
	if (factor > rangeValue)
		return factor + "";
	else
		return "";
}









