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


// var mainWin = Titanium.UI.createWindow();
// var view = Titanium.UI.createView({
	// backgroundColor: '#fff',
// });
// 
// var _logoMarginLeft = (view.width - 253) / 2;
//    
// var logo = Titanium.UI.createImageView({
	  // image: '/images/Doha-News-Logo-Rect-450.png',
	  // width: 253,
	  // height: 65,
	  // left: _logoMarginLeft,
	// top: 0 
// });
// 
// 
// view.add(logo);
// 
// mainWin.add(view);
// mainWin.open();