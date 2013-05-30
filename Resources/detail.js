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
	zIndex: 2,
	top: 0
});


var content = win.content;

var localWebview = Titanium.UI.createWebView({
	top:'.75cm',
    left:10,
    right:10, 
    backgroundColor:'transparent',
	html:content,
	zIndex: 0,
	enableZoomControls: false,
});


Ti.Platform.displayCaps.getPlatformWidth
var incText = Titanium.UI.createButton({
	title:'+',
	right:'40dp',
	zIndex: 2,
});

incText.addEventListener('click',function(e){
	localWebview.evalJS(
		'inc();'
	);
});

var decText = Titanium.UI.createButton({
	title:'-',
	right:'70dp',
	zIndex: 2,
});
	
decText.addEventListener('click',function(e){
	localWebview.evalJS(
		'dec();'
	);
});

var medText = Titanium.UI.createButton({
	title:'o',
	right:'100dp',
	zIndex: 2,
});
	
medText.addEventListener('click',function(e){
	localWebview.evalJS(
		'med();'
	);
});

var menuButton = Titanium.UI.createButton({
	title:'m',
	right:'10dp',
	top: '5dp',
	zIndex: 3
});

var data = [];

var opt = ['images/settings.png'];

var fontSize;
if (osname == 'android')
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/50;
else
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;

for (i = 0; i < opt.length; i++)
{
	var row = Ti.UI.createTableViewRow({
				height: Ti.UI.SIZE,
				backgroundColor:'#black',
				zIndex: 1,
			});
	
	var img = Ti.UI.createImageView({
		image: opt[i],
		width: '50dp',
		height: '50dp',
		zIndex: 1,
	});

	
	row.addEventListener('click',function(){
		alert(opt[i]);
	});
	row.add(img);
	data.push(row);				
}

menuButton.addEventListener('click', function(e){

	if (menu.isVisible == true){
		menu.animate({
			top: Ti.Platform.displayCaps.platformWidth * -1, 
			duration: 1000,
		});
		menu.isVisible = false;
	}
	else{
		menu.animate({
			top: '.75cm', 
			duration: 1000,
		});
		menu.isVisible = true;
	}
});

var menu = Ti.UI.createTableView({
	width: '50dp',
	top: Ti.Platform.displayCaps.platformWidth * -1,
	right: '0dp',
	rowHeight: Ti.UI.SIZE,
	separatorColor: '#70193c',
	backgroundColor:'white',
	zIndex: 1,
	height: Ti.UI.SIZE,
	isVisible : false,
	scrollable: false,
});


menu.setData(data);

win.add(menu);

topBar.add(decText);
topBar.addEventListener('click',function(){
	if(menu.getVisible() == true)
		menu.setVisible(false);
});

localWebview.addEventListener('click',function(){
	if(menu.getVisible() == true)
		menu.setVisible(false);
});

topBar.add(incText);
topBar.add(medText);
win.add(menuButton);
win.add(topBar);
win.add(localWebview);