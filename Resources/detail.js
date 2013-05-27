var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});
win.leftNavButton = button;
	button.addEventListener('click', function()
        {
        win.close();
});

var content = win.content;

var localWebview = Titanium.UI.createWebView({
	scalesPageToFit: true,
	html:content,
	backgroundColor:'white',
	loading: true,
	width: Ti.Platform.displayCaps.platformWidth
});


win.add(localWebview);