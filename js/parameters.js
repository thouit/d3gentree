var param = {
	//colors: [[207, 192, 255], [192, 211, 255], [192, 226, 255], [184, 255, 184], [231, 255, 184], [255, 243, 184], [255, 231, 184], [255, 216, 216], [255, 184, 184], [255, 184, 224], [231, 188, 255]],
	//colors: [[245, 245, 255], [245, 255, 255], [255, 255, 245], [255, 245, 245], [255, 245, 255], [245, 255, 245]],
	colors : [[250, 250, 250]],
	colorsDesc : {"H":["rgb(250, 250, 255)","rgb(245, 245, 255)"], "F":["rgb(255, 250, 250)","rgb(255, 245, 245)"]}, // Color per gender and then {spouse, direct child}
	//colorsDesc : [[245, 245, 250], [250, 245, 250]],
	strokeColor : "#BBB",
	expandStart : 2,
	oneLineNameStart : 6,
	oneLineNameStartDesc: 5,
	stopDisplayName : 9,
	radius : 55,
	centerSize : 85,
	radiusRadial : 145,
	nameFontSize : 11,
	fnameFontSize : 10,
	additionalInfoFontSize: 6,
	downOutsideDesc : 1, // should we write descendants counter-clockwise  ?
	expandStartDesc : 0,
	spouseRadiusRatio : 0.8,
	angleDesc : 0.8 * Math.PI, // if <0 then take the remaining space
	padding : 0.1,
	navigator : 2, //2 for chrome, 1 for Firefox
	factor : 1.05,
	ascDescSpacing : 5, //in pixels,
	descGenerationSpacing : 5, //in pixels
	displayAdditionalInfo : true,
	data: [
		{source: data, angleStart: -0.1*Math.PI, angleStop: 0.3*Math.PI, sourceNb: "0"},
		{source: data2, angleStart: 0.3*Math.PI, angleStop: 0.7*Math.PI, sourceNb: "1"},
		{source: data3, angleStart: 0.7*Math.PI, angleStop: Math.PI*1.1, sourceNb: "2"},
	],
}; 
