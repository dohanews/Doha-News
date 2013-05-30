function inch(size)
{
    // default to 160 dpi if unavailable
    var height = size * 160.0; 

    try
    { 
        // compute header height based on screen density ... target .25" height
        height = size * Ti.Platform.displayCaps.dpi; 
    }
    catch(e) { warn("Error accessing display caps for screen density calculation: " + e); }

    return height;
}

var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});
win.leftNavButton = button;
	button.addEventListener('click', function()
        {
        win.close();
});

var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height:inch(.35),
	top: 0
});


var content = win.content;

var localWebview = Titanium.UI.createWebView({
	top:inch(.35),
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
		font: {fontSize:'6pt'},
		width: '100dp',
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
	width:'100dp',
	top:inch(.35),
	right: '5dp',
	rowHeight: '50dp',
	separatorColor: '#70193c',
	backgroundColor:'white',
	zIndex: 10,
	height:'250dp'
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

