var tabGroup = Titanium.UI.createTabGroup({bottom:-50});

var mainWin = Titanium.UI.createWindow ({
	   navBarHidden: false,
	   barImage: 'images/Doha-News-Logo-Rect-450.png', 
	   layout: "vertical",
	   url: "wordpress.js"
});

var news = Titanium.UI.createTab({  
    title:'News',
    window: mainWin
});

tabGroup.addTab(news);
tabGroup.open();