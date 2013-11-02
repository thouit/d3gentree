var d3gentree = d3gentree || {};

d3gentree.encode_as_img_and_link = function() {
	// Add some critical information
	svg = $("svg").attr({
		version : '1.1',
		xmlns : "http://www.w3.org/2000/svg",
		"xmlns:xlink" : "http://www.w3.org/1999/xlink"
	});
	xmlHeader = '<?xml version="1.0" encoding="Latin1"?>';

	var b64 = btoa(xmlHeader + $("#svg").parent().html().replace(/’/g, "'").replace(/&nbsp;/g, " "));
	// or use btoa if supported

	// Works in recent Webkit(Chrome)
	//$("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
	// Works in Firefox 3.6 and Webkit and possibly any browser which supports the data-uri
	$("body").append($("<div class='download'><a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n" + b64 + "' title='file.svg' download='file.svg'>Download as svg</a></div>"));
}

d3gentree.compute_canvas_size = function(sourceNb) {
	if (param.data[sourceNb].source.ancestors.length < param.asc.expandStart) {
		rMax = param.general.centerSize + param.general.radius * param.data[0].source.ancestors.length - param.general.padding / 2;
	} else {
		rMax = param.general.centerSize + param.general.radius * (param.asc.expandStart - 1) + param.general.radiusRadial * (param.data[sourceNb].source.ancestors.length - (param.asc.expandStart - 1)) - param.general.padding / 2;
	}
	d3gentree.w = 2 * rMax + 50;
	d3gentree.h = 2 * rMax + 50;
}
// Draw center element
d3gentree.draw_center = function(sourceNb) {
	//add center text
	var centerText = d3gentree.vis.append("g")//
	.attr("class", "text")//
	.style("fill", "black");

	centerText.append("text")//
	.style("font-size", param.general.nameFontSize + "px")//
	.style("font-weight", "bold")//
	.attr("dy", -5).attr("text-anchor", "middle")//
	.text(param.data[sourceNb].source.source.name.substring(0, Math.min((param.general.centerSize * 2 / 9) + 1, param.data[sourceNb].source.source.name.length + 1)));

	centerText.append("text")//
	.attr("dy", 15).style("font-size", param.general.fnameFontSize + "px")//
	.attr("text-anchor", "middle")//
	.text(param.data[sourceNb].source.source.fname.substring(0, Math.min((param.general.centerSize * 2 / 9) + 1, param.data[sourceNb].source.source.fname.length + 1)));
}

d3gentree.drawAscendants = function(dataSource, sosa, inR_orig, startA_orig, endA_orig, orient) {
	generation = parseInt(sosa).toString(2).length - 1;
	branch = sosa - Math.pow(2, generation);
	if (generation > param.asc.expandStart) {
		var thisR = param.general.radiusRadial;
		var radialText = 1;
	} else {
		var thisR = param.general.radius;
		var radialText = 0;
	}
	var outR = inR_orig + thisR;
	pers = undefined;
	if (generation > 0 && dataSource.source.ancestors[generation - 1]) {
		pers = dataSource.source.ancestors[generation-1][branch];
		if (pers) {
			dataSource.source.ancestors[generation - 1][branch].index = sosa;
			invert = startA_orig <= 0 ? true : false
			d3gentree.drawPersCell(pers, dataSource.sourceNb, inR_orig + param.general.padding / 2, outR - param.general.padding / 2, startA_orig, endA_orig, generation, orient, radialText, invert, true);
		}
	}
	if (generation < dataSource.source.ancestors.length) {
		var midA = (startA_orig + endA_orig) / 2;
		d3gentree.drawAscendants(dataSource, 2 * sosa, outR, startA_orig, midA, orient);
		d3gentree.drawAscendants(dataSource, 2 * sosa + 1, outR, midA, endA_orig, orient);
	}
}

d3gentree.drawDescendant = function(indivData, sourceNb, inR_orig, startA_orig, endA_orig, generation, orient) {
	// Divide arc per marriages
	if (!indivData.index)
		indivData.index = "0";
	var nbSpouse = indivData.marriages.length;
	if (generation > param.desc.expandStart ? param.general.radiusRadial : param.general.radius) {
		var thisR = param.general.radiusRadial;
		var radialText = 1;
	} else {
		var thisR = param.general.radius;
		var radialText = 0;
	}
	for (var m = 0; m < nbSpouse; ++m) {
		lengthA = (endA_orig - startA_orig) / nbSpouse;
		var startA_s = startA_orig + m * lengthA;
		var endA_s = startA_orig + (m + 1) * lengthA;
		var inR = inR_orig;
		var outR_s = inR + (generation > param.desc.expandStart ? param.general.radiusRadial : param.general.radius) * (generation > param.desc.expandStart ? param.desc.spouseRadiusRatio : 1);
		indivData.marriages[m].spouse.index = indivData.index + "-" + m;
		invert = startA_s > Math.PI ? true : false
		d3gentree.drawPersCell(indivData.marriages[m].spouse, sourceNb, inR + param.general.padding / 2, outR_s - param.general.padding / 2, startA_s, endA_s, generation, (generation > param.desc.expandStart ? 1 : orient), (generation > param.desc.expandStart ? 1 : 0), invert, false)

		for (var c = 0; c < indivData.marriages[m].children.length; ++c) {
			lengthA_c = (endA_s - startA_s) / indivData.marriages[m].children.length;
			var startA = startA_s + c * lengthA_c;
			var endA = startA_s + (c + 1) * lengthA_c;
			var inR = outR_s + param.desc.generationSpacing;
			var outR = inR + (generation + 1 > param.desc.expandStart ? param.general.radiusRadial : param.general.radius);
			indivData.marriages[m].children[c].index = indivData.index + "-" + m + "." + c;
			invert = startA > Math.PI ? true : false
			d3gentree.drawPersCell(indivData.marriages[m].children[c], sourceNb, inR + param.general.padding / 2, outR - param.general.padding / 2, startA, endA, generation + 1, (generation + 1 > param.desc.expandStart ? 1 : orient), (generation + 1 > param.desc.expandStart ? 1 : 0), invert, false)
			d3gentree.drawDescendant(indivData.marriages[m].children[c], sourceNb, outR, startA, endA, generation + 2, orient, (generation > param.desc.expandStart ? 1 : 0));
		}
	}
}

d3gentree.myarc = function(inR, outR, startA, endA, orient) {
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

d3gentree.drawPersCell = function(person, sourceNb, inR, outR, startA, endA, generation, orient, radialText, invert, isAsc) {
	if (!person)
		return;
	var lengthA = Math.abs(endA - startA);
	var middleR = (outR + inR) / 2;

	var xShift = 0;
	var yShift = isAsc ? 0 : param.general.ascDescSpacing;

	var elem = d3gentree.vis.append("svg:path")//
	.attr("d", d3gentree.myarc(inR, outR, startA, endA, orient))//
	.attr("transform", "translate(" + xShift + "," + yShift + ")")//
	.attr("fill", function() {
		if (isAsc) {
			if (person.gender == "H")
				return d3.rgb(param.asc.colors[generation%param.asc.colors.length][0], param.asc.colors[generation%param.asc.colors.length][1], param.asc.colors[generation%param.asc.colors.length][2]);
			else
				return d3.rgb(Math.min(param.asc.colors[generation%param.asc.colors.length][0] * param.asc.spouseColorRatio, 255), Math.min(param.asc.colors[generation%param.asc.colors.length][1] * param.asc.spouseColorRatio, 255), Math.min(param.asc.colors[generation%param.asc.colors.length][2] * param.asc.spouseColorRatio, 255));
		} else {
			if (person.gender == "?")
				return 'rgb(255,255,255)';
			return d3.rgb(param.desc.colors[person.gender][generation % (param.desc.colors[person.gender].length)]);
		}
	}).style("stroke-width", param.general.padding * 2)//
	.style("stroke", param.general.strokeColor)//
	.attr("class", "arc " + generation + " branch")//
	.attr("id", sourceNb + '_' + person.index);

	var text = d3gentree.vis.append("g")//
	.attr("class", "text");

	if (!radialText) {
		var spaceLength = lengthA * ( isAsc ? outR : inR);
		var maxLetter = spaceLength * 2 / param.general.fnameFontSize - 3;

		var letterSpacingName = isAsc ? "1px" : "Opx"
		var letterSpacingfName = isAsc ? "2px" : "-1px"

		text.append("text")//
		.style("font-size", param.general.nameFontSize + "px")//
		.style("font-weight", "bold")//
		.style("letter-spacing", letterSpacingName)//
		.attr("dx", spaceLength / (param.navigator ))//just half of the dx attribute is taken into account when text-anchor middle is used on firefox, works properly on chrome
		.attr("dy", param.general.radius * 0.4)//
		.attr("method", "stretch")//
		.attr("spacing", "auto")//
		.append("textPath")//
		.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
		.attr("text-anchor", "middle")//
		.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

		text.append("text")//
		.style("font-size", param.general.fnameFontSize + "px")//
		.style("font-weight", "300")//
		.style("letter-spacing", letterSpacingfName)//
		.attr("dx", spaceLength / param.navigator)//just half of the dx attribute is taken into account when text-anchor middle is used on firefox, works properly on chrome
		.attr("dy", param.general.radius * 0.8)//
		.attr("method", "stretch")//
		.attr("spacing", "auto")//
		.append("textPath")//
		.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
		.attr("text-anchor", "middle")//
		.text(person.fname.substring(0, Math.min(maxLetter + 2, person.fname.length + 1)));

		if (param.general.displayAdditionalInfo) {
			if (person.birth != null) {
				text.append("text")//
				.style("font-size", param.general.additionalInfoFontSize + "px")//
				.attr("dx", 2)//
				.attr("dy", param.general.radius * 0.12)//
				.attr("method", "stretch")//
				.attr("spacing", "auto")//
				.append("textPath")//
				.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
				.attr("text-anchor", "begin")//
				.text(person.birth.date);
			}

			if (person.death != null) {
				text.append("text")//
				.style("font-size", param.general.additionalInfoFontSize + "px")//
				.attr("dx", 2 * spaceLength / param.navigator - 2)//
				.attr("dy", param.general.radius * 0.12)//
				.attr("method", "stretch")//
				.attr("spacing", "auto")//
				.append("textPath")//
				.attr("xlink:href", "#" + sourceNb + '-' + person.index)//
				.attr("text-anchor", "end")//
				.text(person.death.date);
			}
		}
	} else {
		var maxLetter = (outR - inR) * 1.5 / param.general.fnameFontSize;
		if (generation < ( isAsc ? param.asc.oneLineNameStart : param.desc.oneLineNameStart)) {
			if (invert) {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - Math.PI / 2) + yShift;

				var xx = (inR + 5) * Math.cos((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + xShift;
				var yy = (inR + 5) * Math.sin((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + yShift;

				var xxx = outR * Math.cos(startA - Math.PI / 2) + xShift;
				var yyy = outR * Math.sin(startA - Math.PI / 2) + yShift;

				var xxxx = outR * Math.cos(endA - Math.PI / 2) + xShift;
				var yyyy = outR * Math.sin(endA - Math.PI / 2) + yShift;

				var rotationAngle = ((( orient ? 0 : 180) + ((endA + startA) / 2 - Math.PI / 2) * 180 / Math.PI) + 180);

				text.append("text")//
				.style("font-size", param.general.nameFontSize + "px")//
				.style("font-weight", "bold")//
				.style("text-anchor", "end")//
				.attr("dy", param.general.nameFontSize)//
				.attr("transform", "translate(" + xx + "," + yy + ") rotate(" + rotationAngle + " 0 0)")//
				.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

				text.append("text")//
				.style("font-size", param.general.fnameFontSize + "px")//
				.style("font-weight", "300")//
				.style("text-anchor", "end")//
				.attr("dy", param.general.fnameFontSize)//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + rotationAngle + " 0 0)")//
				.text(person.fname.substring(0, Math.min(maxLetter + 4, person.fname.length + 1)));

				if (param.general.displayAdditionalInfo) {
					if (person.death != null) {
						text.append("text")//
						.style("font-size", param.general.additionalInfoFontSize + "px")//
						.style("text-anchor", "begin")//
						.attr("dx", 2)//
						.attr("dy", -2)//
						.attr("transform", "translate(" + xxxx + "," + yyyy + ") rotate(" + ((( orient ? 0 : 180) + (endA - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
						.text(person.death.date);
					}

					if (person.birth != null) {
						text.append("text")//
						.style("font-size", param.general.additionalInfoFontSize + "px")//
						.style("text-anchor", "begin")//
						.attr("dx", 2)//
						.attr("dy", 7).attr("transform", "translate(" + xxx + "," + yyy + ") rotate(" + ((( orient ? 0 : 180) + (startA - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
						.text(person.birth.date);
					}
				}
			} else {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - Math.PI / 2) + yShift;

				var xx = (inR + 5) * Math.cos((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + xShift;
				var yy = (inR + 5) * Math.sin((endA + startA) / 2 + 10.5 / inR - Math.PI / 2) + yShift;

				var xxx = outR * Math.cos(startA - Math.PI / 2) + xShift;
				var yyy = outR * Math.sin(startA - Math.PI / 2) + yShift;

				var xxxx = outR * Math.cos(endA - Math.PI / 2) + xShift;
				var yyyy = outR * Math.sin(endA - Math.PI / 2) + yShift;

				var rotationAngle = (( orient ? 0 : 180) + ((endA + startA) / 2 - 0.01 - Math.PI / 2) * 180 / Math.PI);

				text.append("text")//
				.style("font-size", param.general.nameFontSize + "px")//
				.style("font-weight", "bold")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + rotationAngle + " 0 0)")//
				.text(person.name.substring(0, Math.min(maxLetter + 1, person.name.length + 1)));

				text.append("text")//
				.style("font-size", param.general.fnameFontSize + "px")//
				.style("font-weight", "300")//
				.attr("transform", "translate(" + xx + "," + yy + ") rotate(" + rotationAngle + " 0 0)")//
				.text(person.fname.substring(0, Math.min(maxLetter + 4, person.fname.length + 1)));

				if (param.general.displayAdditionalInfo) {
					if (person.birth != null) {
						text.append("text")//
						.style("font-size", param.general.additionalInfoFontSize + "px")//
						.style("text-anchor", "end")//
						.attr("dx", -2)//
						.attr("dy", 7)//
						.attr("transform", "translate(" + xxxx + "," + yyyy + ") rotate(" + ((( orient ? 0 : 180) + (endA - Math.PI / 2) * 180 / Math.PI)) + " 0 0)")//
						.attr("xlink:href", "#" + sourceNb + '_' + person.index)//
						.text(person.birth.date);
					}

					if (person.death != null) {
						text.append("text")//
						.style("font-size", param.general.additionalInfoFontSize + "px")//
						.style("text-anchor", "end")//
						.attr("dx", -2)//
						.attr("dy", -2)//
						.attr("transform", "translate(" + xxx + "," + yyy + ") rotate(" + ((( orient ? 0 : 180) + (startA - Math.PI / 2) * 180 / Math.PI)) + " 0 0)")//
						.text(person.death.date);
					}
				}
			}

		} else if (generation < param.general.stopDisplayName) {
			if (invert) {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - Math.PI / 2) + yShift;

				text.append("text")//
				.style("font-size", param.general.fnameFontSize + "px")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + ((( orient ? 0 : 180) + ((endA + startA) / 2 + 0.01 - Math.PI / 2) * 180 / Math.PI) + 180) + " 0 0)")//
				.style("font-weight", "bold")//
				.style("text-anchor", "end")//
				.attr("dy", param.general.fnameFontSize / 2)//
				.text(person.name.substring(0, maxLetter + 4)).append("tspan")//
				.style("font-weight", "300")//
				.text(" " + person.fname.substring(0, maxLetter + 4 - (person.name.length + 1)))
			} else {
				var x = (inR + 5) * Math.cos((endA + startA) / 2 - Math.PI / 2) + xShift;
				var y = (inR + 5) * Math.sin((endA + startA) / 2 - Math.PI / 2) + yShift;

				text.append("text")//
				.style("font-size", param.general.fnameFontSize + "px")//
				.attr("transform", "translate(" + x + "," + y + ") rotate(" + ((endA + startA) / 2 - 0.01 - Math.PI / 2) * 180 / (Math.PI) + " 0 0)")//
				.style("font-weight", "bold")//
				.attr("dy", param.general.fnameFontSize / 2)//
				.text(person.name.substring(0, maxLetter + 4)).append("tspan")//
				.style("font-weight", "300")//
				.text(" " + person.fname.substring(0, maxLetter + 4 - (person.name.length + 1)))//
			}
		}
	}
}

d3gentree.getPersDataFromId = function(persId, sourceNb) {
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

d3gentree.writeDetails = function(dom, fromsvg) {
	var details = {};
	if (!fromsvg) {
		details.sosa = dom.attr('id').split("_")[1];
		details.sourceNb = dom.attr('id').split("_")[0];
	} else {
		details.sosa = dom.prev().attr('id').split("_")[1];
		details.sourceNb = dom.prev().attr('id').split("_")[0];
	}
	pers = d3gentree.getPersDataFromId(details.sosa, details.sourceNb);
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
		hoverString += d3gentree.formatEvent("Né ", pers.birth, "<br />")
	if (pers.baptims != undefined)
		hoverString += d3gentree.formatEvent("Baptisé ", pers.baptism, "<br />")
	if (pers.death != undefined)
		hoverString += d3gentree.formatEvent("Mort ", pers.death, "<br />")
	if (pers.burial != undefined)
		hoverString += d3gentree.formatEvent("Inhumé ", pers.burial, "<br />")
	if (pers.mariage != undefined)
		hoverString += d3gentree.formatEvent("Marié ", pers.mariage, "")
	$("#details").html(hoverString);
}

d3gentree.formatEvent = function(prefix, e, suffix) {
	return !e ? "" : d3gentree.preendIfPresent(prefix, d3gentree.preendIfPresent("à ", e.place, " ") + d3gentree.preendIfPresent("le ", e.date, ""), suffix);
}

d3gentree.preendIfPresent = function(prefix, property, suffix) {
	return !property ? "" : prefix + property + suffix;
}

d3gentree.log2int = function(nb) {
	return Math.ceil(Math.log(nb) / Math.log(2)) - 1;
}

d3gentree.draw = function() {
	for (var i = 0; i < param.data.length; i++) {
		d3gentree.drawAscendants(param.data[i], 1, param.general.centerSize, -param.data[i].angleStart + Math.PI / 2.0, -param.data[i].angleStop + Math.PI / 2.0, 1);
	}

	d3gentree.drawDescendant(param.data[param.desc.sourceNb].source.source, param.data[param.desc.sourceNb].sourceNb, param.general.centerSize, Math.PI + param.desc.angle / 2, Math.PI - param.desc.angle / 2, 0, 0);

	setTimeout(d3gentree.encode_as_img_and_link, 1000);
}

d3gentree.rotate_all = function(angle) {
	d3gentree.currentangle += angle;
	d3gentree.vis//
	.transition()//
	.duration(2000)//
	.attr("transform", "translate(" + d3gentree.w / 2 + "," + d3gentree.h / 2 + ")rotate(" + d3gentree.currentangle + ")")
}

$(document).mousemove(function(e) {
	d3gentree.mouseX = e.pageX + 15;
	d3gentree.mouseY = e.pageY + 5;
	$("#details").css("top", d3gentree.mouseY + "px").css("left", d3gentree.mouseX + "px");
	if (d3gentree.isDragging){
		//var dx = e.pageX - d3gentree.xorig;
    	//var dy = e.pageY - d3gentree.yorig;
    	//var angle = Math.sqrt((dx * dx) + (dy * dy));
    	if (e.pageX < d3gentree.w / 2)
    		d3gentree.rotate_all(-1)
    	else
    		d3gentree.rotate_all(1)
    	//d3gentree.xorig = e.pageX;
		//d3gentree.yorig = e.pageY;
	}
	
})
.mousedown(function(e) {
    d3gentree.isDragging = true;
})
.mouseup(function(e) {
    d3gentree.isDragging = false;
});

(function() {
	d3gentree.isDragging = false;
	d3gentree.currentangle = 0;
	d3gentree.compute_canvas_size(0);

	d3gentree.vis = d3.select("#container").append("svg:svg")//create the SVG element inside the <body>
	.attr("width", d3gentree.w)//set the width and height of our visualization (these will be attributes of the <svg> tag
	.attr("height", d3gentree.h)//
	.attr("id", "svg")//
	.append("svg:g")//make a group to hold our pie chart
	.attr("transform", "translate(" + d3gentree.w / 2 + "," + d3gentree.h / 2 + ")")//move the center of the pie chart from 0, 0 to center or drawing area

	d3gentree.draw_center(0);

	d3gentree.draw();

	var svg_xml = (new XMLSerializer()).serializeToString(document.getElementById("svg"));

	//display source code
	//$("#code").text(svg_xml.replace(/’/g, "'").replace(/&nbsp;/g, " "));

	d3gentree.mouseX
	d3gentree.mouseY

	$("g.text").hover(function() {
		$(this).prev().svg().addClass("hover");
		d3gentree.writeDetails($(this), true);
		$("#details").css("display", "block");
	}, function() {
		$(this).prev().svg().removeClass("hover");
		$("#details").css("display", "none");
	});
	$(".arc").hover(function() {
		//console.log($(this).attr('id'));
		d3gentree.writeDetails($(this), false);
		$("#details").css("display", "block");
	}, function() {
		$("#details").css("display", "none");
	});

})();

