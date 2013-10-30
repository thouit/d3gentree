var global = {}

compute_canvas_size(0);

var vis = d3.select("#container").append("svg:svg")//create the SVG element inside the <body>
.attr("width", global.w)//set the width and height of our visualization (these will be attributes of the <svg> tag
.attr("height", global.h)//
.attr("id", "svg")//
.append("svg:g")//make a group to hold our pie chart
.attr("transform", "translate(" + global.w / 2 + "," + global.h / 2 + ")")//move the center of the pie chart from 0, 0 to center or drawing area

draw_center(0);

for (var i = 0; i < param.data.length; i++){
	drawAscendants(param.data[i], 1, param.centerSize, -param.data[i].angleStart + Math.PI / 2.0, -param.data[i].angleStop + Math.PI / 2.0, 1);
}

drawDescendant(param.data[param.descSourceNb].source.source, param.data[param.descSourceNb].sourceNb, param.centerSize, Math.PI + param.angleDesc / 2, Math.PI - param.angleDesc / 2, 0, 0);

//setTimeout(encode_as_img_and_link, 1000);

function encode_as_img_and_link() {
	// Add some critical information
	svg = $("svg").attr({
		version : '1.1',
		xmlns : "http://www.w3.org/2000/svg"
	});
	xmlHeader = '<?xml version="1.0" encoding="Latin1"?>';
	var b64 = btoa(xmlHeader + $("#svg").parent().html());
	// or use btoa if supported

	// Works in recent Webkit(Chrome)
	//$("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
	// Works in Firefox 3.6 and Webkit and possibly any browser which supports the data-uri
	$("body").append($("<div class='download'><a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n" + b64 + "' title='file.svg' download='file.svg'>Download as svg</a></div>"));
}

function compute_canvas_size(sourceNb){
	global.r = 0;
	if (param.data[sourceNb].source.ancestors.length < param.expandStart) {
		rMax = param.centerSize + param.radius * param.data[0].source.ancestors.length - param.padding / 2;
	} else {
		rMax = param.centerSize + param.radius * (param.expandStart - 1) + param.radiusRadial * (param.data[sourceNb].source.ancestors.length - (param.expandStart - 1)) - param.padding / 2;
	}
	global.w = 2 * rMax + 50;
	global.h = 2 * rMax + 50;
}

// Draw center element
function draw_center(sourceNb){
	//add center text
	var centerText = vis.append("g")//
	.attr("class", "text")//
	.style("fill", "black");
	
	centerText.append("text")//
	.style("font-size", param.nameFontSize + "px")//
	.style("font-weight", "bold")//
	.attr("dy", -5).attr("text-anchor", "middle")//
	.text(param.data[sourceNb].source.source.name.substring(0, Math.min((param.centerSize * 2 / 9) + 1, param.data[sourceNb].source.source.name.length + 1)));
	
	centerText.append("text")//
	.attr("dy", 15).style("font-size", param.fnameFontSize + "px")//
	.attr("text-anchor", "middle")//
	.text(param.data[sourceNb].source.source.fname.substring(0, Math.min((param.centerSize * 2 / 9) + 1, param.data[sourceNb].source.source.fname.length + 1)));
}

function drawAscendants(dataSource, sosa, inR_orig, startA_orig, endA_orig, orient) {
	generation = parseInt(sosa).toString(2).length - 1;
	branch = sosa - Math.pow(2, generation);
	if (generation > param.expandStart) {
		var thisR = param.radiusRadial;
		var radialText = 1;
	} else {
		var thisR = param.radius;
		var radialText = 0;
	}
	var outR = inR_orig + thisR;
	pers = undefined;
	if (generation > 0 && dataSource.source.ancestors[generation - 1]) {
		pers = dataSource.source.ancestors[generation-1][branch];
		if (pers) {
			dataSource.source.ancestors[generation - 1][branch].index = sosa;
			invert = startA_orig <= 0 ? true : false
			drawPersCell(pers, dataSource.sourceNb, inR_orig + param.padding / 2, outR - param.padding / 2, startA_orig, endA_orig, generation, orient, radialText, invert, true);
		}
	}
	if (generation < dataSource.source.ancestors.length) {
		var midA = (startA_orig + endA_orig) / 2;
		drawAscendants(dataSource, 2 * sosa, outR, startA_orig, midA, orient);
		drawAscendants(dataSource, 2 * sosa + 1, outR, midA, endA_orig, orient);
	}
}

function drawDescendant(indivData, sourceNb, inR_orig, startA_orig, endA_orig, generation, orient) {
	// Divide arc per marriages
	if (!indivData.index)
		indivData.index = "0";
	var nbSpouse = indivData.marriages.length;
	if (generation > param.expandStartDesc ? param.radiusRadial : param.radius) {
		var thisR = param.radiusRadial;
		var radialText = 1;
	} else {
		var thisR = param.radius;
		var radialText = 0;
	}
	for (var m = 0; m < nbSpouse; ++m) {
		lengthA = (endA_orig - startA_orig) / nbSpouse;
		var startA_s = startA_orig + m * lengthA;
		var endA_s = startA_orig + (m + 1) * lengthA;
		var inR = inR_orig;
		var outR_s = inR + (generation > param.expandStartDesc ? param.radiusRadial : param.radius);
		indivData.marriages[m].spouse.index = indivData.index + "-" + m;
		invert = startA_s > Math.PI ? true : false
		drawPersCell(indivData.marriages[m].spouse, sourceNb, inR + param.padding / 2, outR_s - param.padding / 2, startA_s, endA_s, generation, (generation > param.expandStartDesc ? 1 : orient), (generation > param.expandStartDesc ? 1 : 0), invert, false)

		for (var c = 0; c < indivData.marriages[m].children.length; ++c) {
			lengthA_c = (endA_s - startA_s) / indivData.marriages[m].children.length;
			var startA = startA_s + c * lengthA_c;
			var endA = startA_s + (c + 1) * lengthA_c;
			var inR = outR_s + param.descGenerationSpacing;
			var outR = inR + (generation + 1 > param.expandStartDesc ? param.radiusRadial : param.radius);
			indivData.marriages[m].children[c].index = indivData.index + "-" + m + "." + c;
			invert = startA > Math.PI ? true : false
			drawPersCell(indivData.marriages[m].children[c], sourceNb, inR + param.padding / 2, outR - param.padding / 2, startA, endA, generation + 1, (generation + 1 > param.expandStartDesc ? 1 : orient), (generation + 1 > param.expandStartDesc ? 1 : 0), invert, false)
			drawDescendant(indivData.marriages[m].children[c], sourceNb, outR, startA, endA, generation + 2, orient, (generation > param.expandStartDesc ? 1 : 0));
		}
	}
}

function myarc(inR, outR, startA, endA, orient) {
	d3_arcOffset = 3 * Math.PI / 2;
	if (startA > endA) {
		t = endA;
		endA = startA;
		startA = t;
	}
	endA = endA + d3_arcOffset;
	startA = startA + d3_arcOffset;
	u = inR, t = outR, s = Math.cos(endA), f = Math.sin(endA), h = Math.cos(startA), d = Math.sin(startA);
	greatCircle = (endA - startA) > Math.PI ? "1" : "0";
	if (orient)
		return arcPath2 = "M" + t * h + "," + t * d + "A" + t + "," + t + " 0 " + greatCircle + ",1 " + t * s + "," + t * f + "L" + u * s + "," + u * f + "A" + u + "," + u + " 0 " + greatCircle + ",0 " + u * h + "," + u * d + "Z";
	else
		return arcPath2 = "M" + u * s + "," + u * f + "A" + u + "," + u + " 0 " + greatCircle + ",0 " + u * h + "," + u * d + "L" + t * h + "," + t * d + "A" + t + "," + t + " 0 " + greatCircle + ",1 " + t * s + "," + t * f + "Z";
}

function drawPersCell(person, sourceNb, inR, outR, startA, endA, generation, orient, radialText, invert, isAsc) {
	if (!person)
		return;
	var lengthA = Math.abs(endA - startA);
	var middleR = (outR + inR) / 2;

	var xShift = 0;
	//generation * param.padding * Math.cos((startA + endA) / 2 - Math.PI / 2);
	var yShift = isAsc ? 0 : param.ascDescSpacing;
	//generation * param.padding * Math.sin((startA + endA) / 2 - Math.PI / 2);

	var elem = vis.append("svg:path")//
	.attr("d", myarc(inR, outR, startA, endA, orient))//
	.attr("transform", "translate(" + xShift + "," + yShift + ")")//
	.attr("fill", function() {
		if (isAsc) {
			if (person.gender == "H")
				return d3.rgb(param.colors[generation%param.colors.length][0], param.colors[generation%param.colors.length][1], param.colors[generation%param.colors.length][2]);
			else
				return d3.rgb(Math.min(param.colors[generation%param.colors.length][0] * param.factor, 255), Math.min(param.colors[generation%param.colors.length][1] * param.factor, 255), Math.min(param.colors[generation%param.colors.length][2] * param.factor, 255));
		} else {
			if (person.gender == "?")
				return 'rgb(255,255,255)';
			return d3.rgb(param.colorsDesc[person.gender][generation % (param.colorsDesc[person.gender].length)]);
		}
	}).style("stroke-width", param.padding * 2)//
	.style("stroke", param.strokeColor)//
	.attr("class", "arc " + generation + " branch")//
	.attr("id", sourceNb + '_' + person.index);
	//

	var text = vis.append("g")//
	.attr("class", "text");

	if (!radialText) {
		var spaceLength = lengthA * ( isAsc ? outR : inR);
		var maxLetter = spaceLength * 2 / param.fnameFontSize - 3;

		var letterSpacingName = isAsc ? "1px" : "Opx"
		var letterSpacingfName = isAsc ? "2px" : "-1px"

		text.append("text")//
		.style("font-size", param.nameFontSize + "px")//
		.style("font-weight", "bold")//
		.style("letter-spacing", letterSpacingName)//
		.attr("dx", spaceLength / (param.navigator ))//just half of the dx attribute is taken into account when text-anchor middle is used on firefox, works properly on chrome
		.attr("dy", param.radius * 0.4)//
		.attr("method", "stretch")//
		.attr("spacing", "auto")//
		.append("textPath")//
		.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
		.attr("text-anchor", "middle")//
		.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

		text.append("text")//
		.style("font-size", param.fnameFontSize + "px")//
		.style("font-weight", "300")//
		.style("letter-spacing", letterSpacingfName)//
		.attr("dx", spaceLength / param.navigator)//just half of the dx attribute is taken into account when text-anchor middle is used on firefox, works properly on chrome
		.attr("dy", param.radius * 0.8)//
		.attr("method", "stretch")//
		.attr("spacing", "auto")//
		.append("textPath")//
		.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
		.attr("text-anchor", "middle")//
		.text(person.fname.substring(0, Math.min(maxLetter + 2, person.fname.length + 1)));

		if (param.displayAdditionalInfo) {
			if (person.birth != null) {
				text.append("text")//
				.style("font-size", param.additionalInfoFontSize + "px")//
				.attr("dx", 2)//
				.attr("dy", param.radius * 0.12)//
				.attr("method", "stretch")//
				.attr("spacing", "auto")//
				.append("textPath")//
				.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
				.attr("text-anchor", "begin")//
				.text(person.birth.date);
			}

			if (person.death != null) {
				text.append("text")//
				.style("font-size", param.additionalInfoFontSize + "px")//
				.attr("dx", 2 * spaceLength / param.navigator - 2)//
				.attr("dy", param.radius * 0.12)//
				.attr("method", "stretch")//
				.attr("spacing", "auto")//
				.append("textPath")//
				.attr("xlink:href", "#" + sourceNb + '-' + person.index)//
				.attr("text-anchor", "end")//
				.text(person.death.date);
			}
		}
	} else {
		var maxLetter = (outR - inR) * 1.5 / param.fnameFontSize;
		var lineThicknessCorrection = -9.0 / inR;
		var lineThicknessCorrectionOneLine = -0.012;
		if (generation < ( isAsc ? param.oneLineNameStart : param.oneLineNameStartDesc)) {
			if (invert) {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - 0.005 - Math.PI / 2 + lineThicknessCorrection) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - 0.005 - Math.PI / 2 + lineThicknessCorrection) + yShift;

				var xx = (inR + 5) * Math.cos((endA + startA) / 2 + 10.5 / inR - Math.PI / 2 + lineThicknessCorrection) + xShift;
				var yy = (inR + 5) * Math.sin((endA + startA) / 2 + 10.5 / inR - Math.PI / 2 + lineThicknessCorrection) + yShift;

				var xxx = outR * Math.cos(startA - Math.PI / 2) + xShift;
				var yyy = outR * Math.sin(startA - Math.PI / 2) + yShift;

				var xxxx = outR * Math.cos(endA - Math.PI / 2) + xShift;
				var yyyy = outR * Math.sin(endA - Math.PI / 2) + yShift;

				text.append("text")//
				.style("font-size", param.nameFontSize + "px")//
				.style("font-weight", "bold")//
				.style("text-anchor", "end")//
				.attr("transform", "translate(" + xx + "," + yy + ") rotate(" + ((( orient ? 0 : 180) + ((endA + startA) / 2 + 0.03 - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
				.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

				text.append("text")//
				.style("font-size", param.fnameFontSize + "px")//
				.style("font-weight", "300")//
				.style("text-anchor", "end")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + ((( orient ? 0 : 180) + ((endA + startA) / 2 - 0.01 - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
				.text(person.fname.substring(0, Math.min(maxLetter + 4, person.fname.length + 1)));

				if (param.displayAdditionalInfo) {
					if (person.death != null) {
						text.append("text")//
						.style("font-size", param.additionalInfoFontSize + "px")//
						.style("text-anchor", "begin")//
						.attr("dx", 2)//
						.attr("dy", -2)//
						.attr("transform", "translate(" + xxxx + "," + yyyy + ") rotate(" + ((( orient ? 0 : 180) + (endA - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
						.text(person.death.date);
					}

					if (person.birth != null) {
						text.append("text")//
						.style("font-size", param.additionalInfoFontSize + "px")//
						.style("text-anchor", "begin")//
						.attr("dx", 2)//
						.attr("dy", 7).attr("transform", "translate(" + xxx + "," + yyy + ") rotate(" + ((( orient ? 0 : 180) + (startA - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
						.text(person.birth.date);
					}
				}
			} else {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - 0.005 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - 0.005 - Math.PI / 2) + yShift;

				var xx = (inR + 5) * Math.cos((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + xShift;
				var yy = (inR + 5) * Math.sin((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + yShift;

				var xxx = outR * Math.cos(startA - Math.PI / 2) + xShift;
				var yyy = outR * Math.sin(startA - Math.PI / 2) + yShift;

				var xxxx = outR * Math.cos(endA - Math.PI / 2) + xShift;
				var yyyy = outR * Math.sin(endA - Math.PI / 2) + yShift;

				text.append("text")//
				.style("font-size", param.nameFontSize + "px")//
				.style("font-weight", "bold")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + (( orient ? 0 : 180) + ((endA + startA) / 2 - 0.01 - Math.PI / 2) * 180 / Math.PI) + " 0 0)")//
				.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

				text.append("text")//
				.style("font-size", param.fnameFontSize + "px")//
				.style("font-weight", "300")//
				.attr("transform", "translate(" + xx + "," + yy + ") rotate(" + (( orient ? 0 : 180) + ((endA + startA) / 2 + 0.03 - Math.PI / 2) * 180 / Math.PI) + " 0 0)")//
				.text(person.fname.substring(0, Math.min(maxLetter + 4, person.fname.length + 1)));

				if (param.displayAdditionalInfo) {
					if (person.birth != null) {
						text.append("text")//
						.style("font-size", param.additionalInfoFontSize + "px")//
						.style("text-anchor", "end")//
						.attr("dx", -2)//
						.attr("dy", 7)//
						.attr("transform", "translate(" + xxxx + "," + yyyy + ") rotate(" + ((( orient ? 0 : 180) + (endA - Math.PI / 2) * 180 / Math.PI)) + " 0 0)")//
						.text(person.birth.date);
					}

					if (person.death != null) {
						text.append("text")//
						.style("font-size", param.additionalInfoFontSize + "px")//
						.style("text-anchor", "end")//
						.attr("dx", -2)//
						.attr("dy", -2)//
						.attr("transform", "translate(" + xxx + "," + yyy + ") rotate(" + ((( orient ? 0 : 180) + (startA - Math.PI / 2) * 180 / Math.PI)) + " 0 0)")//
						.text(person.death.date);
					}
				}
			}

		} else if (generation < param.stopDisplayName) {
			var toWrite = person.name + " " + person.fname;
			if (invert) {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 + 0.005 - Math.PI / 2 + lineThicknessCorrectionOneLine) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 + 0.005 - Math.PI / 2 + lineThicknessCorrectionOneLine) + yShift;

				text.append("text")//
				.style("font-size", param.fnameFontSize + "px")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + ((( orient ? 0 : 180) + ((endA + startA) / 2 + 0.01 - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
				.style("font-weight", "bold")//
				.style("text-anchor", "end")//
				.text(person.name.substring(0, maxLetter + 4)).append("tspan")//
				.style("font-weight", "300")//
				.text(" " + person.fname.substring(0, maxLetter + 4 - (person.name.length + 1)))
			} else {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 + 0.005 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 + 0.005 - Math.PI / 2) + yShift;

				text.append("text")//
				.style("font-size", param.fnameFontSize + "px")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + ((endA + startA) / 2 - 0.01 - Math.PI / 2) * 180 / (Math.PI) + " 0 0)")//
				.style("font-weight", "bold")//
				.text(person.name.substring(0, maxLetter + 4)).append("tspan")//
				.style("font-weight", "300")//
				.text(" " + person.fname.substring(0, maxLetter + 4 - (person.name.length + 1))).text(toWrite.substring(0, Math.min(maxLetter + 4, toWrite.length + 1)));
			}
		}
	}
}

var svg_xml = (new XMLSerializer()).serializeToString(document.getElementById("svg"));

//display source code
$("#code").text(svg_xml);

var mouseX;
var mouseY;
$(document).mousemove(function(e) {
	mouseX = e.pageX + 15;
	mouseY = e.pageY + 5;
	$("#details").css("top", mouseY + "px").css("left", mouseX + "px");
});

$("g.text").hover(function() {
	$(this).prev().svg().addClass("hover");
	writeDetails($(this), true);
	$("#details").css("display", "block");
}, function() {
	$(this).prev().svg().removeClass("hover");
	$("#details").css("display", "none");
});
$(".arc").hover(function() {
	//console.log($(this).attr('id'));
	writeDetails($(this), false);
	$("#details").css("display", "block");
}, function() {
	$("#details").css("display", "none");
});

function getPersDataFromId(persId, sourceNb) {
	if (!persId)
		return;
	if (persId.length < 2 || persId[1] != "-") {
		generation = parseInt(persId).toString(2).length - 1;
		branch = parseInt(persId) - Math.pow(2, generation);
		return param.data[sourceNb].source.ancestors[generation - 1][branch];
	} else {
		function recAddress(obj, path) {
			p = path.match(/(?:-(\d+)(?:\.(\d+))?)?(.*)/);
			if (p[2])
				return recAddress(obj.marriages[p[1]].children[p[2]], p[3]);
			if (p[1])
				return obj.marriages[p[1]].spouse;
			return obj;
		}

		return recAddress(param.data[sourceNb].source.source, persId.slice(1));
	}
}

function writeDetails(dom, fromsvg) {
	var details = {};
	if (!fromsvg){
		details.sosa = dom.attr('id').split("_")[1];
		details.sourceNb = dom.attr('id').split("_")[0];
	} else {
		details.sosa = dom.prev().attr('id').split("_")[1];
		details.sourceNb = dom.prev().attr('id').split("_")[0];
	}
	//details.generation = nDom.attr('class').split(" ")[1];
	//details.branch = nDom.attr('class').split(" ")[2].substring(6,nDom.attr('class').split(" ")[2].length);
	pers = getPersDataFromId(details.sosa, details.sourceNb);
	if (!pers)
		return;
	details.brothers = "";
	for (var i = 0; i < pers.brothers; i++) {
		details.brothers += "&#8226";
	}
	details.name = pers.name;
	details.fname = pers.fname;
	hoverString = "";
	if (details.name != undefined)
		hoverString += "<strong>" + details.name + "</strong> ";
	if (details.fname != undefined)
		hoverString += details.fname + "<br />"
	if (details.brothers != undefined)
		hoverString += details.brothers + "<br/>"
	if (details.sosa != undefined)
		hoverString += "Sosa : " + details.sosa + "<br /><br />"
	if (pers.birth != undefined)
		hoverString += formatEvent("Né ", pers.birth, "<br />")
	if (pers.baptims != undefined)
		hoverString += formatEvent("Baptisé ", pers.baptism, "<br />")
	if (pers.death != undefined)
		hoverString += formatEvent("Mort ", pers.death, "<br />")
	if (pers.burial != undefined)
		hoverString += formatEvent("Inhumé ", pers.burial, "<br />")
	if (pers.mariage != undefined)
		hoverString += formatEvent("Marié ", pers.mariage, "")
	$("#details").html(hoverString);
}

function formatEvent(prefix, e, suffix) {
	return !e ? "" : preendIfPresent(prefix, preendIfPresent("à ", e.place, " ") + preendIfPresent("le ", e.date, ""), suffix);
}

function preendIfPresent(prefix, property, suffix) {
	return !property ? "" : prefix + property + suffix;
}

function log2int(nb) {
	return Math.ceil(Math.log(nb) / Math.log(2)) - 1;
}
