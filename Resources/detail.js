var osname = Ti.Platform.osname;

var win = Ti.UI.currentWindow;
win.navBarHidden = true;
win.layout = 'vertical';

var content = win.content;

var closeButton = Titanium.UI.createButton({title:'Close'});
win.leftNavButton = closeButton;

var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height:'.75cm',
	zIndex: 2,
	top: 0
});

var localWebview = Titanium.UI.createWebView({
	//top:'.75cm',
    left:10,
    right:10, 
    backgroundColor:'transparent',
	html:content,
	enableZoomControls: false,
	textSize: 1,
	disableBounce: true
});

var disqus = Titanium.UI.createWebView({
	//top:'.75cm',
    //left:10,
    //right:10, 
    backgroundColor:'transparent',
	enableZoomControls: false,
	textSize: 1,
	disableBounce: true,
	url: "http://dev.dohanews.co/wp-content/public/disqus.html",
	zIndex: 40,
});

var textsize = Titanium.UI.createImageView({
	title:'o',
	right:'55dp',
	image: 'images/textsize.png',
	zIndex: 2,
});
	
textsize.addEventListener('click',function(e){
	if (localWebview.textSize == 0){
		localWebview.evalJS('med();');
		localWebview.textSize = 1;
	}
	else if (localWebview.textSize == 1){
		localWebview.evalJS('inc();');
		localWebview.textSize = 2;
	}
	else if (localWebview.textSize == 2){
		localWebview.evalJS('dec();');
		localWebview.textSize = 0;
	}
});

var menuButton = Titanium.UI.createImageView({
	image:'images/menu.png',
	width: '0.75cm',
	height: '0.75cm',
	top: 0,
	right: 0,
	zIndex: 3
});


var fontSize;
if (osname == 'android')
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/50;
else
	fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;
	
var data = [];

var opt = ['images/settings.png','images/photos.png','images/videos.png','images/articles.png'];

for (i = 0; i < opt.length; i++)
{
	var row = Ti.UI.createTableViewRow({
				height: Ti.UI.SIZE,
				zIndex: 1,
			});
	
	var img = Ti.UI.createImageView({
		image: opt[i],
		width: '50dp',
		height: '50dp',
		zIndex: 1,
	});

	
	row.addEventListener('click',function(){
		var win = Ti.UI.createWindow({
			backgroundColor: '#fff',
			url: 'upload_photo.js',
			modal: true,
		});
		win.open();
	});
	row.add(img);
	data.push(row);				
}

menuButton.addEventListener('click', function(e){

	if (menu.isVisible == true){
		menu.animate({
			top: '-210dp', 
			duration: 500,
		});
		menu.isVisible = false;
	}
	else{
		menu.animate({
			top: '.75cm', 
			duration: 500,
		});
		menu.isVisible = true;
	}
});

var menu = Ti.UI.createTableView({
	width: '50dp',
	top: '-210dp', 
	right: '0dp',
	rowHeight: Ti.UI.SIZE,
	separatorColor: 'black',
	backgroundColor:'white',
	zIndex: 1,
	height: Ti.UI.SIZE,
	isVisible : false,
	scrollable: false,
});

var topLogo = Titanium.UI.createImageView({
	image:'images/logo.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	left: 0,
	zIndex: 3
});

topLogo.addEventListener('click', function(){
	win.close();
});

menu.setData(data);

win.add(menu);

topBar.addEventListener('click',function(){
	if (menu.isVisible == true){
		menu.animate({
			top: '-210dp', 
			duration: 500,
		});
		menu.isVisible = false;
	}	
});

// localWebview.addEventListener('click',function(){
	// if (menu.isVisible == true){
		// menu.animate({
			// top: '-210dp', 
			// duration: 500,
		// });
		// menu.isVisible = false;
	// }
// });

topBar.add(textsize);
topBar.add(topLogo);
win.add(topBar);
//win.add(menuButton);
//win.add(localWebview);
win.add(disqus);
//scrollView.add(localWebview);
//win.add(scrollView);