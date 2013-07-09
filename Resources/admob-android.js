/**
 * Copyright (c) 2011 by Studio Classics. All Rights Reserved.
 * Author: Brian Kurzius
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

//var win = Ti.UI.currentWindow;


// require AdMob
var Admob = require('ti.admob');

// then create an adMob view
var createAdMobView = function()
{
	
	var admobView = Admob.createView({
		publisherId:"a151b84088431cc",
	    testing:false, // default is false
	    //top: 10, //optional
	    //left: 0, // optional
	    //right: 0, // optional
	    //bottom: 0, // optional 
	    adBackgroundColor:"FF8855", // optional
	    backgroundColorTop: "738000", //optional - Gradient background color at top
	    borderColor: "#000000", // optional - Border color
	    textColor: "#000000", // optional - Text color
	    urlColor: "#00FF00", // optional - URL color
	    linkColor: "#0000FF" //optional -  Link text color    
	});	
	
	var row = Ti.UI.createTableViewRow({
		height: '50dp',
		backgroundColor:'#fdfcf8',
		//backgroundColor: 'red',
		width: Ti.Platform.displayCaps.platformWidth,
		bubbleParent: false,
	});
	
	row.add(admobView);
	return row;
}



/*
//listener for adReceived
adMobView.addEventListener(Admob.AD_RECEIVED,function(){
   alert("ad received");
   Ti.API.info("ad received");
});

//listener for adNotReceived
adMobView.addEventListener(Admob.AD_NOT_RECEIVED,function(){
    alert("ad not received");
     Ti.API.info("ad not received");
});


var adRequestBtn = Ti.UI.createButton({
    title:"Request an ad",
    top:"10%",
    height: "10%",
    width: "80%"
});

adRequestBtn.addEventListener("click",function(){
    adMobView.requestAd();
});

var adRequestBtn2 = Ti.UI.createButton({
    title: "Request a test ad",
    top: "25%",
    height: "10%",
    width: "80%"
});

adRequestBtn2.addEventListener("click",function(){
    adMobView.requestTestAd();
});
win.add(adRequestBtn);
win.add(adRequestBtn2);
*/
/*
	
	var admobView1 = Admob.createView({
		publisherId:"a151b84088431cc",
	    testing:false, // default is false
	    //top: 10, //optional
	    //left: 0, // optional
	    //right: 0, // optional
	    bottom: 0, // optional 
	    adBackgroundColor:"FF8855", // optional
	    backgroundColorTop: "738000", //optional - Gradient background color at top
	    borderColor: "#000000", // optional - Border color
	    textColor: "#000000", // optional - Text color
	    urlColor: "#00FF00", // optional - URL color
	    linkColor: "#0000FF" //optional -  Link text color    
	});	

	
	
	var admobView2 = Admob.createView({
		publisherId:"a151b84088431cc",
	    testing:false, // default is false
	    //top: 10, //optional
	    //left: 0, // optional
	    //right: 0, // optional
	    bottom: 100, // optional 
	    adBackgroundColor:"FF8855", // optional
	    backgroundColorTop: "738000", //optional - Gradient background color at top
	    borderColor: "#000000", // optional - Border color
	    textColor: "#000000", // optional - Text color
	    urlColor: "#00FF00", // optional - URL color
	    linkColor: "#0000FF" //optional -  Link text color    
	});	


	var admobView3 = Admob.createView({
		publisherId:"a151b84088431cc",
	    testing:false, // default is false
	    //top: 10, //optional
	    //left: 0, // optional
	    //right: 0, // optional
	    bottom: 200, // optional 
	    adBackgroundColor:"FF8855", // optional
	    backgroundColorTop: "738000", //optional - Gradient background color at top
	    borderColor: "#000000", // optional - Border color
	    textColor: "#000000", // optional - Text color
	    urlColor: "#00FF00", // optional - URL color
	    linkColor: "#0000FF" //optional -  Link text color    
	});	
	
	// then create an adMob view*/

// var createAdMobView1 = function(h)
// {
	// var admobView = Admob.createView({
		// publisherId:"a151b84088431cc",
	    // testing:false, // default is false
	    // //top: 10, //optional
	    // //left: 0, // optional
	    // //right: 0, // optional
	    // bottom: h, // optional 
	    // adBackgroundColor:"FF8855", // optional
	    // backgroundColorTop: "738000", //optional - Gradient background color at top
	    // borderColor: "#000000", // optional - Border color
	    // textColor: "#000000", // optional - Text color
	    // urlColor: "#00FF00", // optional - URL color
	    // linkColor: "#0000FF" //optional -  Link text color    
	// });
// 	
	// return admobView;	
// }
// 
//  
// win.add(createAdMobView1(0));
// win.add(createAdMobView1(100));
// win.add(createAdMobView1(200));
