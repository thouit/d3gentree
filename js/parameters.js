var parameters = function() {
	this.general = {
		strokeColor: "#BBBBBB", //
		displayAdditionalInfo: true, // display additional information into each cell such as birth and death date and place
		additionalInfoFontSize: 6, // font size for additionnal informations (date and place of birth and death for example)
		ascDescSpacing: 15, // spacing between ascendant and descendant tree in pixels,
		radius: 55, // radius of a normal cell
		centerSize: 85, // center radius 
		radiusRadial: 145, // radius of a radial cell
		nameFontSize: 11,  // font size for the family name
		fnameFontSize: 10, // font size for the first name
		stopDisplayName: 9, // when to stop to display any information
		padding: 0.1, //
		interParentsMargin: 1, // in pixels
		interParentsMarginOnlyNewGen: true, // if we create gap only for non already separated persons
	};
	this.asc = {
		colors: [[250, 250, 250]], // colors per generation
		oneLineNameStart: 6, // When to use one line to display the name instead of two
		expandStart: 2, // When to switch to radial view
		spouseColorRatio: 1.05,
	};
	this.desc = {
		colors: {   H: ["rgb(235, 235, 255)", "rgb(215, 215, 255)"], 
                        F: ["rgb(255, 235, 235)", "rgb(255, 215, 215)"]}, // Color per gender and then {spouse, direct child}
		oneLineNameStart: 5, // When to use one line to display the name instead of two for the descendance
		expandStart: 0, // when to switch to radial view for descendants
		spouseRadiusRatio: 0.8,
		generationSpacing: 5, // in pixels
		angle: 0.8*Math.PI, //
		sourceNb: 0, //
	};
	this.centerSourceId = 0; // Source file of the central person
	this.data = [
		{source: 'data.papi.js', angleStart: -0.0*Math.PI, angleStop: 1.0*Math.PI},
		//{source: 'data.papi.js', angleStart: 0.3*Math.PI, angleStop: 0.7*Math.PI},
		//{source: data3, angleStart: 0.7*Math.PI, angleStop: Math.PI*1.1, sourceNb: "2"},
	];
	this.formatEventStr = {  birth:{H: "Né", F:"Née",'?': "Né"},
                                        baptism:{H: "Baptisé", F:"Baptisée",'?': "Baptisé"},
                                        death:{H: "Décédé", F:"Décédée",'?': "Décédé"},
                                        burial:{H: "Inhumé", F:"Inhumée",'?': "Inhumé"},
                                        wedding:{H: "Marié", F:"Mariée",'?': "Marié"},
                                        divorce:{H: "Divorcé", F:"Divorcée",'?': "Divorcé"},
    };
}; 
