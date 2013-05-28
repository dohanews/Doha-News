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
    height:1280,
    width:720,
    backgroundColor:'transparent',
    touchEnabled:false,
	scalesPageToFit: true,
	html:content,
	enableZoomControls: false,
});


win.add(localWebview);