// parse url parameters
var drug = getParameterByName("drug");
var reaction = getParameterByName("reaction");
var count = getParameterByName("count");
var soc = getParameterByName("soc");
var serious = getParameterByName("serious");
document.getElementById("reactiondrug").innerHTML = "<table class=\"table table-striped\">" +
													   "<tr><td><b>Adverse reaction</b></td><td>" + reaction + "</td></tr>" +
													   "<tr><td><b>Involved drug</b></td><td>" 	 + drug     + "</td></tr>" +
													   "<tr><td><b>Total reports</b></td><td>"    + count    + "</td></tr>" +
													   "<tr><td><b>Disease class</b></td><td>"    + soc      + "</td></tr>" +
													    "<tr><td><b>Seriousness</b></td><td>"    + serious      + "%</td></tr>" +
													"</table>";

// tooltips
var tooltip = d3.select("body").append("div").attr("class", "tooltipDonut").style("opacity", 0);
		
// set canvas		
var margin = {top: 0, right: 30, bottom: 0, left: 30}, width = 900 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
var svg = d3.select("#mosaicplot").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var barWidth = 700;
var barHeight = 100;
var maleCount = parseInt(getParameterByName("countmale"),10);
var femaleCount = parseInt(getParameterByName("countfemale"),10);
var youngCount = parseInt(getParameterByName("countyoung"),10);
var adultCount = parseInt(getParameterByName("countadult"),10);
var elderlyCount = parseInt(getParameterByName("countelderly"),10);
var genderTotal =  maleCount + femaleCount;
var ageTotal = youngCount + adultCount + elderlyCount;
var maleFactor = maleCount/genderTotal;
var femaleFactor = femaleCount/genderTotal;
var youngFactor = youngCount/ageTotal;
var adultFactor = adultCount/ageTotal;
var elderlyFactor = elderlyCount/ageTotal;
var maleWidth = barWidth*maleFactor;
var femaleWidth = barWidth*femaleFactor;
var youngWidth = barWidth*youngFactor;
var adultWidth = barWidth*adultFactor;
var elderlyWidth = barWidth*elderlyFactor;
var deathCount = parseInt(getParameterByName("countdeath"),10); 
var disabCount = parseInt(getParameterByName("countdisab"),10); 
var anomalCount = parseInt(getParameterByName("countanomal"),10);
var threatCount = parseInt(getParameterByName("countthreat"),10); 
var hospCount = parseInt(getParameterByName("counthosp"),10); 
var otherCount = parseInt(getParameterByName("countother"),10);
var outcomeTotal =  deathCount+disabCount+anomalCount+threatCount+hospCount+otherCount;
var deathFactor = deathCount/outcomeTotal;
var deathWidth = barWidth*deathFactor;
var disabFactor = disabCount/outcomeTotal;
var disabWidth = barWidth*disabFactor;
var anomalFactor = anomalCount/outcomeTotal;
var anomalWidth = barWidth*anomalFactor;
var threatFactor = threatCount/outcomeTotal;
var threatWidth = barWidth*threatFactor;
var hospFactor = hospCount/outcomeTotal;
var hospWidth = barWidth*hospFactor;
var otherFactor = otherCount/outcomeTotal;
var otherWidth = barWidth*otherFactor;


// rects gender
svg.append("rect").attr("class", "male").attr("x", 0).attr("y", 0).attr("width", maleWidth).attr("height", barHeight).style("fill", "steelblue");
svg.append("rect").attr("class", "female").attr("x", maleWidth).attr("y", 0).attr("width", femaleWidth).attr("height", barHeight).style("fill", "pink");    

// rects age group
svg.append("rect").attr("class", "young").attr("x", 0).attr("y", barHeight).attr("width", youngWidth).attr("height", barHeight).style("fill", "lightgreen");
svg.append("rect").attr("class", "adult").attr("x", youngWidth).attr("y", barHeight).attr("width", adultWidth).attr("height", barHeight).style("fill", "orange"); 
svg.append("rect").attr("class", "elderly").attr("x", youngWidth + adultWidth).attr("y", barHeight).attr("width", elderlyWidth).attr("height", barHeight).style("fill", "purple");

// rects outcome
svg.append("rect").attr("class", "death").attr("x", 0).attr("y", barHeight*2).attr("width", deathWidth).attr("height", barHeight).style("fill", "red");
svg.append("rect").attr("class", "disab").attr("x", deathWidth).attr("y", barHeight*2).attr("width", disabWidth).attr("height", barHeight).style("fill", "PaleTurquoise");
svg.append("rect").attr("class", "anomal").attr("x", deathWidth+disabWidth).attr("y", barHeight*2).attr("width", anomalWidth).attr("height", barHeight).style("fill", "green");
svg.append("rect").attr("class", "threat").attr("x", deathWidth+disabWidth+anomalWidth).attr("y", barHeight*2).attr("width", threatWidth).attr("height", barHeight).style("fill", "Orchid");
svg.append("rect").attr("class", "hosp").attr("x", deathWidth+disabWidth+anomalWidth+threatWidth).attr("y", barHeight*2).attr("width", hospWidth).attr("height", barHeight).style("fill", "Khaki");
svg.append("rect").attr("class", "other").attr("x", deathWidth+disabWidth+anomalWidth+threatWidth+hospWidth).attr("y", barHeight*2).attr("width", otherWidth).attr("height", barHeight).style("fill", "lightgrey");

// tooltips gender
svg.selectAll(".male")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Male " + parseInt(Math.round(maleFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".female")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Female " + parseInt(Math.round(femaleFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });

// tooltips age group
svg.selectAll(".young")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Young " + parseInt(Math.round(youngFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".adult")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Adult " + parseInt(Math.round(adultFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });  
svg.selectAll(".elderly")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Elderly " + parseInt(Math.round(elderlyFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });

// tooltips outcome
svg.selectAll(".death")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Death " + parseInt(Math.round(deathFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".disab")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Disability " + parseInt(Math.round(disabFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".anomal")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Congenital anomaly " + parseInt(Math.round(anomalFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".threat")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Life threatening " + parseInt(Math.round(threatFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });
svg.selectAll(".hosp")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Hospitalization " + parseInt(Math.round(hospFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });  
svg.selectAll(".other")
	.on("mouseover", function(d) { 
		tooltip.transition().duration(200).style("opacity", 1);      
        tooltip.html("Other " + parseInt(Math.round(otherFactor*100),10) + "%").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");  })                 
    .on("mouseout", function(d) { tooltip.transition().duration(200) .style("opacity", 0);  });    
    

var size = 14;
var xRect = barWidth + 20;
var xText = barWidth + 35;
var yRect = size + 2;
var yText = size + 10;

// legends gender
svg.append("rect").attr("x", xRect).attr("y", 0).attr("width", size).attr("height", size).style("fill", "steelblue");
svg.append("rect").attr("x", xRect).attr("y", yRect).attr("width", size).attr("height", size).style("fill", "pink");
svg.append("text").attr("x", xText).attr("y", 10).style("text-anchor", "begin").text("Male");
svg.append("text").attr("x", xText).attr("y", yText).style("text-anchor", "begin").text("Female");

// legends age group
svg.append("rect").attr("x", xRect).attr("y", barHeight).attr("width", size).attr("height", size).style("fill", "lightgreen");
svg.append("rect").attr("x", xRect).attr("y", barHeight+yRect).attr("width", size).attr("height", size).style("fill", "orange");
svg.append("rect").attr("x", xRect).attr("y", barHeight+yRect+yRect).attr("width", size).attr("height", size).style("fill", "purple");
svg.append("text").attr("x", xText).attr("y", barHeight+10).style("text-anchor", "begin").text("Young <21");
svg.append("text").attr("x", xText).attr("y", barHeight+2+yText).style("text-anchor", "begin").text("Adult 21-65");	
svg.append("text").attr("x", xText).attr("y", barHeight+yText+18).style("text-anchor", "begin").text("Elderly >65");	

// legends outcome
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight).attr("width", size).attr("height", size).style("fill", "red");
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight+yRect).attr("width", size).attr("height", size).style("fill", "PaleTurquoise");
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight+yRect+yRect).attr("width", size).attr("height", size).style("fill", "green");
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight+yRect+yRect+yRect).attr("width", size).attr("height", size).style("fill", "Orchid");
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight+yRect+yRect+yRect+yRect).attr("width", size).attr("height", size).style("fill", "Khaki");
svg.append("rect").attr("x", xRect).attr("y", barHeight+barHeight+yRect+yRect+yRect+yRect+yRect).attr("width", size).attr("height", size).style("fill", "lightgrey");
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+10).style("text-anchor", "begin").text("Death");
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+2+yText).style("text-anchor", "begin").text("Disability");	
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+yText+18).style("text-anchor", "begin").text("Congenital anomaly");
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+yText+yText+11).style("text-anchor", "begin").text("Life threatening");
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+yText+yText+yText+2).style("text-anchor", "begin").text("Hospitalization");
svg.append("text").attr("x", xText).attr("y", barHeight+barHeight+yText+yText+yText+yText-6).style("text-anchor", "begin").text("Other");


// Parses parameter value from a given parameter name
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
