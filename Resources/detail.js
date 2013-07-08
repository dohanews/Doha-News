var osname = Ti.Platform.osname;
Ti.include('ios-sharing.js');////////////////
var common = require('ios-common');
var db = require('database');

var fb_regex = /(^http:\/\/disqus.com\/_ax\/facebook\/complete)/;
var twitter_regex = /(^http:\/\/disqus.com\/_ax\/twitter\/complete)/;
var google_regex = /(^http:\/\/disqus.com\/_ax\/google\/complete)/;
var disqus_reqex = /(^http:\/\/disqus.com\/next\/login-success)/

var win = Ti.UI.currentWindow;
win.navBarHidden = true;

var content = win.content;
var articleId = win.id; /////////////////
var url = win.articleUrl;/////////////////
var title = win.articleTitle;/////////////////
var thumbnail = win.thumbnail;/////////////////
var date = win.date;/////////////////
var author =  win.author;/////////////////


var header = common.create_header();


var bookmark = create_bookmarks(title, url, author, content, date, articleId);
bookmark.center = null;
bookmark.right = 0;
bookmark.top = '0dp';
bookmark.zIndex = 50;
header.add(bookmark);
header.addEventListener('click',function(){
	win.close();
})

var localWebview = Titanium.UI.createWebView({
	top:'45dp',
    backgroundColor:'transparent',
	html:content,
	enableZoomControls: false,
	textSize: 1,
	disableBounce: true,
});

var create_disqus = function(){
	var disqus = Titanium.UI.createWebView({
		//top:'.75cm',
	    //left:10,
	    //right:10, 
	    backgroundColor:'transparent',
		enableZoomControls: false,
		textSize: 1,
		disableBounce: true,
		url: "http://dev.dohanews.co/wp-content/public/disqusTest.html",
		zIndex: 40,
	});
	
	disqus.addEventListener('load',function(e){
	   	console.log('Url is: '+e.url);
		if(e.url.match(fb_regex) || e.url.match(twitter_regex) || e.url.match(google_regex) || e.url.match(disqus_reqex)){
	    	console.log ('it\'s facebook');
	    	win.remove(disqus);
	    	disqus = null;
	       	disqus = create_disqus();
	       	win.add(disqus);
    	}
	});
	return disqus;
}

var disqus = create_disqus();

var textsize = Titanium.UI.createImageView({
	right:'55dp',
	image: 'images/textsize.png',
	zIndex: 2,
	height: '45dp',
	width: '45dp',
	bubbleParent: false,
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

var share = Titanium.UI.createImageView({
	left:'0',
	image: 'images/search.png',
	zIndex: 2,
	height: '45dp',
	width: '45dp',
	bubbleParent: false,
});

share.addEventListener('click', function(){
	sharekit.share({
	  		title: title,
			link: url,
	    	view: textsize,
	  });
});

header.add(share);
header.add(textsize);

win.add(header);
win.add(localWebview);


//win.add(disqus);