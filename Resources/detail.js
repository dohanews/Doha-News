var win = Ti.UI.currentWindow;

var content = win.content;

var localWebview = Titanium.UI.createWebView({
	html:content,
});

win.add(localWebview);