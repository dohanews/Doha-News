var osname = Ti.Platform.osname;

var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});
win.leftNavButton = button;
	button.addEventListener('click', function()
        {
        win.close();
});

var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height:'.75cm',
	top: 0
});


var content = win.content;

var localWebview = Titanium.UI.createWebView({
	top:'.75cm',
    left:10,
    right:10, 
    backgroundColor:'transparent',
	html:content,
	enableZoomControls: false,
});


Ti.Platform.displayCaps.getPlatformWidth
var incText = Titanium.UI.createButton({
	title:'+',
	right:'40dp',
});

incText.addEventListener('click',function(e){
	localWebview.evalJS(
		'inc();'
	);
});

var decText = Titanium.UI.createButton({
	title:'-',
	right:'70dp',
});
	
decText.addEventListener('click',function(e){
	localWebview.evalJS(
		'dec();'
	);
});

var medText = Titanium.UI.createButton({
	title:'o',
	right:'100dp',
});
	
medText.addEventListener('click',function(e){
	localWebview.evalJS(
		'med();'
	);
});

var menuButton = Titanium.UI.createButton({
	title:'m',
	right:'10dp',
});

var data = [];

var opt = ['settings1','settings2','settings3','settings4','settings5']


var fontSize;
if (osname == 'android')
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/50;
else
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;

for (i = 0; i <5;i++)
{
	var row = Ti.UI.createTableViewRow({
				height: Ti.UI.SIZE,
				backgroundColor:'#black',
			});
	
	var label = Ti.UI.createLabel({
		text: opt[i],
		backgroundColor:'black',
		color: 'white',
		font: {fontSize:fontSize},
		width: '2cm',
		height:'.5cm',
	});
	row.add(label);
	data.push(row);				
}

menuButton.addEventListener('click', function(e){

	if (menu.getVisible() == true)
		menu.setVisible(false);
	else
		menu.setVisible(true);
});

var menu = Ti.UI.createTableView({
	width:'2cm',
	top:'.75cm',
	right: '5dp',
	rowHeight: '.5cm',
	separatorColor: '#70193c',
	backgroundColor:'white',
	zIndex: 10,
	height: Ti.UI.SIZE,
	
});


menu.setData(data);

menu.setVisible(false);

win.add(menu);


topBar.add(decText);
topBar.add(incText);
topBar.add(medText);
topBar.add(menuButton);
win.add(topBar);
win.add(localWebview);

