var win = Ti.UI.currentWindow;
win.layout = 'vertical';
win.backgroundColor = 'white';

var common;
var font, boldFont = 'droidsans';

if (Ti.Platform.osname != 'android'){
	common = require('ios-common');
	var header = common.create_header(true, true);
	
	var back = Ti.UI.createImageView({
		image: 'images/backarrow.png',
		height: '20dp',
	});
	
	back.addEventListener('click', function(){win.close();});
	
	header.add(back);
	win.add(header);
	
	font = 'Helvetica';
	boldFont = 'Helvetica-Bold';
}


var aboutView = Ti.UI.createView({
	top: 0,
	height: Ti.UI.SIZE,
	width: Ti.UI.FILL,
	layout: 'vertical',
});

var scrollView = Ti.UI.createScrollView({
  contentWidth: Ti.Platform.displayCaps.platformWidth,
  contentHeight: Ti.UI.SIZE,
  width: Ti.Platform.displayCaps.platformWidth,
  height: '100%',
});

var logo = Ti.UI.createImageView({
	image: "images/dohanews-full.png",
	top: '10dp',
	width: '60%',
});

var about = Ti.UI.createLabel({
	text: "We are Qatar’s first digital news organization.\n\nSince 2009, Doha News has been bringing you breaking news and the latest on politics, business, culture and life in and around Qatar.\n\nWe’re a startup staffed by a small but versatile team of experienced journalists, who’ve worked for Al Jazeera English, the BBC and the Wall Street Journal. Our goal is to educate, inform, and stimulate positive change in society.\n\nBlending curation with original reporting, our stories are driven by our community, but professionally written and edited to meet the highest standards of journalism.\n\nTips, comments or suggestions? Email us at editor@dohanews.co",
	font:{
			fontSize: '17dp',
			fontFamily: font,
		},
	top: '10dp',
	left: '15dp',
	right: '15dp',
	height: Ti.UI.SIZE,
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});

var rate = Ti.UI.createButton({
	title: 'Rate Our App',
	top: '15dp',
	width: '50%',
});

rate.addEventListener('click', function(){
	Ti.Platform.openURL('https://play.google.com/store/apps/details?id=com.dohanews');
});

var createMember = function(name, position){
	var credit = Ti.UI.createView({
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		//layout: 'vertical',
	});
	
	var member = Ti.UI.createLabel({
		text: name, 
		font: {
			fontSize: '17dp',
			fontFamily: font,
		},
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		top: '5dp',
	});
	
	var title = Ti.UI.createLabel({
		text: position,
		font: {
			fontSize: '15dp',
			fontFamily: font,
			//fontWeight: 'bold',
		},
		color: '#70193c',
		top: '23dp',
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	});

	credit.add(member);
	credit.add(title);
	
	return credit;
};

var credits = Ti.UI.createLabel({
	text: 'Credits',
	top: '10dp',
	font: {
			fontSize: '19dp',
			fontFamily: boldFont,
			fontWeight: 'bold',
		},
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});


var appTeam = Ti.UI.createLabel({
	text: 'App Team',
	top: '25dp',
	font: {
			fontSize: '17dp',
			fontFamily: font,
			fontWeight: 'bold',
		},
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});

var anas = createMember('Anas Halbawi', 'Project Manager & Lead Develper');
var ali = createMember('Ali Naqi', 'Product Manager & Developer');
var noshin = createMember('Noshin Nisa', 'User Interface Lead');
var zaid = createMember('Zaid Haque', 'User Experience Consultant');

var comd = createMember('Check Out My Design', 'Design Consultants');
comd.top = '10dp';

var coreTeam = Ti.UI.createLabel({
	text: 'Doha News Core Team',
	top: '15dp',
	font: {
			fontSize: '17dp',
			fontFamily: boldFont,
			fontWeight: 'bold',
		},
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});

var omar = createMember('Omar Chatriwala',  'Publisher');
var shabina = createMember('Shabina S. Khatri', 'Editor');
var victoria = createMember('Victoria Scott', 'Assistant Editor');

var versionView = Ti.UI.createView({
	width: Ti.UI.SIZE,
	height: Ti.UI.SIZE,
	layout: 'vertical',
	top: '25dp',
});

var version = Ti.UI.createLabel({
	text: 'Version', 
	font: {
		fontSize: '17dp',
		fontFamily: font,
	},
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});

var number = Ti.UI.createLabel({
	text: '1.0.0',
	font: {
		fontSize: '17dp',
		fontFamily: font,
	},
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
});

versionView.add(version);
versionView.add(number);

aboutView.add(logo);
aboutView.add(about);

aboutView.add(appTeam);
aboutView.add(anas);
aboutView.add(ali);
aboutView.add(noshin);
aboutView.add(zaid);

aboutView.add(comd);

aboutView.add(coreTeam);
aboutView.add(omar);
aboutView.add(shabina);
aboutView.add(victoria);

aboutView.add(versionView);

aboutView.add(rate);

scrollView.add(aboutView);
win.add(scrollView);