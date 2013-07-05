var db = require('database');
db.createTable();

var prefix = Ti.Platform.osname == 'android'? 'and' : 'ios';
Ti.App.bookmarksChanged = true;
Ti.App.tabgroup = Titanium.UI.createTabGroup({
	bottom: 0,
	navBarHidden: true,
	tabsBackgroundColor: 'silver',
});

var articlesWin = Titanium.UI.createWindow ({
   url: prefix + "-wordpress.js",
   id: 'articles',
   orientationModes: [Titanium.UI.PORTRAIT],
});

var bookmarksWin = Titanium.UI.createWindow ({
   url: prefix + "-bookmarks.js",
   id: 'bookmarks',
   orientationModes: [Titanium.UI.PORTRAIT],
});

var photosWin = Titanium.UI.createWindow({
	url: 'photos.js',
	id: 'photos',
	navBarHidden: true,
})

if (Ti.Platform.osname != 'android'){
	bookmarksWin.navBarHidden = true;
	articlesWin.navBarHidden = true;
}


var bookmarks = Titanium.UI.createTab({
	title: 'Bookmarks',
	window: bookmarksWin,
	
});

var articles = Titanium.UI.createTab({
	title: 'Articles',
	window: articlesWin,

});
var photos = Titanium.UI.createTab({
	title: 'Photos',
	window: photosWin,
});

//mainWin.open();
Ti.App.tabgroup.addTab(articles);
//Ti.App.tabgroup.addTab(book);
Ti.App.tabgroup.addTab(bookmarks);
Ti.App.tabgroup.addTab(photos);
Ti.App.tabgroup.open();
Ti.App.tabgroupVisible = true;

