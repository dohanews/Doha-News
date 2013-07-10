var osname = Ti.Platform.osname;
var db = require('database');

var win = Ti.UI.currentWindow;
win.navBarHidden = true;

var header;
var common;

if (osname != 'android'){
	Ti.include('ios-sharing.js');
	common = require('ios-common');
	header = common.create_header();
}
else{
	Ti.include('and-sharing.js');
	Ti.include('and-common.js');
	header = create_header();

}
	
var content = win.content;
var articleId = win.id;
var url = win.articleUrl;
var title = win.articleTitle;
var thumbnail = win.thumbnail;
var date = win.date;
var author =  win.author;

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

if (osname == 'android'){
	
	share.addEventListener('click',function(){      
		var activity = Ti.Android.currentActivity;
		var intent = Ti.Android.createIntent({
		            action: Ti.Android.ACTION_SEND,
		            type: 'text/plain'
		        });
		
		intent.putExtra(Ti.Android.EXTRA_TEXT, url);
		intent.putExtra(Ti.Android.EXTRA_DONT_KILL_APP);
		intent.putExtra(Ti.Android.EXTRA_SUBJECT, title);
		activity.startActivity(Ti.Android.createIntentChooser(intent,'Share via'));	
	});
}
else{
	share.addEventListener('click', function(){
		
		var dialog = Ti.UI.createOptionDialog({
			title: "Share",
			options: ['Twitter', 'Facebook', 'Mail', 'Cancel'],
			cancel: 3 // index of cancel option
		});
	 
		dialog.addEventListener('click', function(e) {
			if(e.index == e.cancel) { 
				return; 
			}
			
			var sharer = null;
			var shareTitle;
	
			switch(e.index) {
				case 0:
					sharer = 'Twitter';
					shareTitle = '@dohanews ' + title;
					break;
				case 1:
					sharer = 'Facebook';
					shareTitle = title;
					break;
				case 2:
					sharer = 'Mail';
					shareTitle = title;
					break;
			}
		 
			if (sharer == 'Mail'){
				var emailDialog = Ti.UI.createEmailDialog({
					subject: shareTitle,
					messageBody: url,
				});
				emailDialog.open();
			}
			else{
				sharekit.share({
					title: shareTitle,
					link: url,
					sharer: sharer,
					view: share
				});
			}
		});
		
		dialog.show();
	});
}
header.add(share);
header.add(textsize);

win.add(header);
win.add(localWebview);


//win.add(disqus);