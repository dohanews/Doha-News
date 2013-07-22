var osname = Ti.Platform.osname;
var db = require('database');
var cache = require('cache');

var win = Ti.UI.currentWindow;
win.navBarHidden = true;

var header;
var common;
var activityIndicator;
if (osname != 'android'){
	Ti.include('ios-sharing.js');
	common = require('ios-common');
	header = common.create_header();
	activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});
	
}
else{
	Ti.include('and-sharing.js');
	Ti.include('and-common.js');
	header = create_header();
	activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.ActivityIndicatorStyle.DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});
	win.activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		var searchItem = menu.add({
			title: 'Search',
			itemId: 1,
			icon: 'images/search.png',
			showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS, 
		});
	}
}

win.add(activityIndicator);
activityIndicator.show();

//var content = win.content;
var articleId = win.id;
var url = win.articleUrl;
var title = win.articleTitle;
var thumbnail = win.thumbnail;
var date = win.date;
var author =  win.author;
var content;


var localWebview = Titanium.UI.createWebView({
		top:'45dp',
	    backgroundColor:'transparent',
		enableZoomControls: false,
		textSize: 1,
		disableBounce: true,
});


win.add(header);

var loadDetail = function(){
	var bookmark = create_bookmarks(title, url, author, content, date, articleId, thumbnail);
	bookmark.center = null;
	bookmark.right = 0;
	bookmark.top = '0dp';
	bookmark.zIndex = 50;
	header.add(bookmark);
	header.addEventListener('click',function(){
		win.close();
	})
	
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
}

if (cache.exists(articleId)){
	content = cache.getContent(articleId);
	loadDetail();
	localWebview.html = content;
	activityIndicator.hide();
	win.add(localWebview);
}
else{
	var loader = Ti.Network.createHTTPClient({Timeout:1000});
	loader.open('GET', 'http://dndev.staging.wpengine.com/?json=get_post&post_id=' + articleId + '&dev=1&include=content');
	loader.onload = function(){		
		var response = JSON.parse(this.responseText);
		content = response.post.content;
		cache.insert(articleId, content, date);
		loadDetail();
		localWebview.html = content;
		activityIndicator.hide();
		win.add(localWebview);

	}
	loader.onerror = function(){
		alert('error');
	}
	loader.send();
}
//win.add(disqus);