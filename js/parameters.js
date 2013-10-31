var param = {
	general: {
		strokeColor: "#BBB", //
		additionalInfoFontSize: 6, // font size for additionnal informations (date and place of birth and death for example)
		ascDescSpacing: 15, // spacing between ascendant and descendant tree in pixels,
		radius: 55, // radius of a normal cell
		centerSize: 85, // center radius 
		radiusRadial: 145, // radius of a radial cell
		nameFontSize: 11,  // font size for the family name
		fnameFontSize: 10, // font size for the first name
		stopDisplayName: 9, // when to stop to display any information
		padding: 0.1, //
		displayAdditionalInfo: true, // display additional information into each cell such as birth and death date and place
	},
	asc: {
		colors: [[250, 250, 250]], // colors per generation
		oneLineNameStart: 6, // When to use one line to display the name instead of two
		expandStart: 2, // When to switch to radial view
		spouseColorRatio: 1.05,
	},
	desc: {
		colors: {"H": ["rgb(250, 250, 255)", "rgb(245, 245, 255)"], "F": ["rgb(255, 250, 250)", "rgb(255, 245, 245)"]}, // Color per gender and then {spouse, direct child}
		oneLineNameStart: 5, // When to use one line to display the name instead of two for the descendance
		expandStart: 0, // when to switch to radial view for descendants
		spouseRadiusRatio: 0.8,
		generationSpacing: 5, // in pixels
		angle: 0.8*Math.PI, //
		sourceNb: 0, //
	},
	navigator: 2, //2 for chrome, 1 for Firefox
	data: [
		{source: data, angleStart: -0.1*Math.PI, angleStop: 1.1*Math.PI, sourceNb: "0"},
		//{source: data2, angleStart: 0.3*Math.PI, angleStop: 0.7*Math.PI, sourceNb: "1"},
		//{source: data3, angleStart: 0.7*Math.PI, angleStop: Math.PI*1.1, sourceNb: "2"},
	],
}; 
