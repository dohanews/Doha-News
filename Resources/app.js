var db = require('database');
db.createTable();

var prefix = Ti.Platform.osname == 'android'? 'and' : 'ios';
Ti.App.bookmarksChanged = true;
Ti.App.tabgroup = Titanium.UI.createTabGroup({
	bottom: 0,
	navBarHidden: true,
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
	window: bookmarksWin,
});
var videos = Titanium.UI.createTab({
	title: 'Videos',
	window: bookmarksWin,
});

//mainWin.open();
Ti.App.tabgroup.addTab(articles);

//Ti.App.tabgroup.addTab(book);
Ti.App.tabgroup.addTab(bookmarks);
Ti.App.tabgroup.addTab(photos);
Ti.App.tabgroup.addTab(videos);

Ti.App.tabgroup.open();
Ti.App.tabgroupVisible = true;

if (Ti.Platform.osname == 'ios'){
var icons = ['images/tab_articles_active.png',
			'images/tab_articles_inactive.png',
			'images/tab_bookmarks_active.png',
			'images/tab_bookmarks_inactive.png',
			'images/tab_photos_active.png',
			'images/tab_photos_inactive.png',
			'images/tab_videos_active.png',
			'images/tab_videos_inactive.png'];
			
var background = Ti.UI.createView({
	backgroundColor: '#f9f9f9',
	width: Ti.UI.FILL,
	height: '50dp',
	bottom: 0,
	touchEnabled: false,
})

var backgroundHeader = Ti.UI.createView({
	backgroundColor: '#b2b2b2',
	height: '1dp',
	top: 0,
	touchEnabled: false,
});

var tabWidth = (1/Ti.App.tabgroup.tabs.length)*Ti.Platform.displayCaps.platformWidth;
for (var i = 0, l = Ti.App.tabgroup.tabs.length; i < l; i++) {
	
	left = (tabWidth*i) + ((tabWidth-25)/2);
	var tab = Ti.App.tabgroup.tabs[i];
		
	var tabTitle = Ti.UI.createLabel({
		text: tab.title,
		font: {fontSize: '12dp'},
		color: '#a3a3a3',
		bottom: '4dp',
		center: {x:(tabWidth * (i + 0.5))},
		touchEnabled: false,
	})
	var selectedImage = Ti.UI.createImageView({
		image: icons[i*2],
		width: '25dp',
		height: '25dp',
		top: '5dp',
		center: {x:(tabWidth * (i + 0.5))},
		touchEnabled: false,
		visible: false,
	});
	var deselectedImage = Ti.UI.createImageView({
		image: icons[(i*2)+1],
		width: '25dp',
		height: '25dp',
		top: '5dp',
		center: {x:(tabWidth * (i + 0.5))},
		touchEnabled: false,
	});
 	
 	if (i == 0){
 		selectedImage.visible = true;
 		tabTitle.color = '#167efc';
 	}
    background.add(tab.deselected = deselectedImage);
    background.add(tab.selected = selectedImage);
    background.add(tab.tabTitle = tabTitle); 
}

Ti.App.tabgroup.addEventListener('focus', overrideFocusTab);
Ti.App.tabgroup.add(background);
Ti.App.tabgroup.overrideTabs = background;
background.add(backgroundHeader);

function overrideFocusTab(evt) {
    if (evt.previousIndex >= 0) {
        evt.source.tabs[evt.previousIndex].selected.visible = false;
        evt.source.tabs[evt.previousIndex].tabTitle.color = '#a3a3a3';
    }
    evt.tab.selected.visible = true;
	evt.tab.tabTitle.color = '#167efc';    
}}

