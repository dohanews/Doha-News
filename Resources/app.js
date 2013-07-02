var db = require('database');
db.createTable();

var fb = require('facebook');
fb.appid = "520290184684825";
fb.permissions = ['publish_stream', 'offline_access']; // Permissions your app needs
fb.forceDialogAuth = true;

Ti.App.fbLoggedIn = fb.getLoggedIn();

Ti.App.tabgroup = Titanium.UI.createTabGroup({
	bottom: 0,
	navBarHidden: true,	
});

var articlesWin = Titanium.UI.createWindow ({
   url: "wordpress.js",
   id: 'articles',
   orientationModes: [Titanium.UI.PORTRAIT],
});

var bookmarksWin = Titanium.UI.createWindow ({
   url: "bookmarks.js",
   id: 'bookmarks',
   orientationModes: [Titanium.UI.PORTRAIT],
});

if (Ti.Platform.osname != 'android')
	articlesWin.navBarHidden = true;

// var articles = Titanium.UI.createTab({
	// title: 'Art',
	// window: articlesWin,
// });
var bookmarks = Titanium.UI.createTab({
	title: 'Bookmarks',
	window: bookmarksWin,
	
});

var articles = Titanium.UI.createTab({
	title: 'Articles',
	window: articlesWin,

});
// var photos = Titanium.UI.createTab({
	// title: 'Photos',
	// window: videosWin,
// });

//mainWin.open();
Ti.App.tabgroup.addTab(articles);
//Ti.App.tabgroup.addTab(book);
Ti.App.tabgroup.addTab(bookmarks);
//Ti.App.tabgroup.addTab(photos);
Ti.App.tabgroup.open();
Ti.App.tabgroupVisible = true;

