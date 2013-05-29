var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});
win.leftNavButton = button;
	button.addEventListener('click', function()
        {
        win.close();
});

var content = win.content;

var localWebview = Titanium.UI.createWebView({
	top:0,
    left:10,
    right:10,
    height:Ti.UI.currentWindow.getHeight,
    width:Ti.UI.currentWindow.getWidth,
    backgroundColor:'transparent',
	scalesPageToFit: true,
	html:content,
	enableZoomControls: false,
});

var incText = Titanium.UI.createButton({
	title:'+',
	left:500,
	top:500});

incText.addEventListener('click',function(e){
	localWebview.evalJS(
		'inc();'
	);
});

var decText = Titanium.UI.createButton({
	title:'-',
	left:600,
	top:600});
	
decText.addEventListener('click',function(e){
	localWebview.evalJS(
		'dec();'
	);
});

alert('opened');
win.add(localWebview);
win.add(decText);
win.add(incText);