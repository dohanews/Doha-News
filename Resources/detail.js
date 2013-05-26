var win = Ti.UI.currentWindow;

var content = win.content;

var localWebview = Titanium.UI.createWebView({
	html:content,
	width:'auto'
});

win.add(localWebview);