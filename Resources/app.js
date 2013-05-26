var tabGroup = Titanium.UI.createTabGroup({bottom:-50});

var mainWin = Titanium.UI.createWindow ({
	   title: "Doha News",
	   url: "wordpress.js"
});

var news = Titanium.UI.createTab({  
    title:'News',
    window: mainWin
});

tabGroup.addTab(news);  
tabGroup.open();