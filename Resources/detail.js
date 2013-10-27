var osname = Ti.Platform.osname;
var db = require('database');
var cache = require('cache');

var win = Ti.UI.currentWindow;
win.bubbleParent = true;

var daytime = true;

var header;
var common;
//var options;
var overlay;
var pinches = 0;

var activityIndicator;
if (osname != 'android'){
	Ti.include('ios-sharing.js');
	common = require('ios-common');
	
	overlay = Ti.UI.createView({
		backgroundColor: 'red',
		opacity: 0.5,
		width: Ti.Platform.displayCaps.platformWidth,
		height: Ti.Platform.displayCaps.platformHeight,
		bubbleParent: true,
		zIndex: 2,
	});
	
	header = common.create_header(true, true, true);

	var back = Ti.UI.createImageView({
		image: 'images/backarrow.png',
		height: '20dp',
		left: 0,
		center: {y: common.isiOS7? '45dp': '25dp'},
	});
	
	back.addEventListener('click', function(){win.close();});
	header.add(back);
	
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
}

win.add(activityIndicator);
activityIndicator.show();

var content = win.content;
var articleId = win.id;
var url = win.articleUrl;
var title = win.articleTitle;
var thumbnail = win.thumbnail;
var date = win.date;
var author =  win.author;

var localWebview = Titanium.UI.createWebView({
		top: common.isiOS7? '65dp':'45dp',
	    backgroundColor:'w',
		enableZoomControls: false,
		textSize: 1,
		pinching: 15,
		disableBounce: true,
		touchEnabled: true,
		zIndex: 5,
		html: content,
		bubbleParent: true,
		willHandleTouches: false,
});

var changeTextSize = function(e){
	pinches++;

	var current = localWebview.pinching;
	if (pinches == 10){
		current *= e.scale;
		
		if (current > 24)
			current = 24;
		else if (current < 10)
			current = 10;
			
		localWebview.pinching = current;
		localWebview.evalJS('changeSize('+localWebview.pinching+');');
		pinches = 0;
	}
};

win.addEventListener('pinch', changeTextSize);

win.add(header);

var loadDetail = function(){
	var bookmark = create_bookmarks(title, url, author, content, date, articleId, thumbnail);
	bookmark.center = null;
	bookmark.right = 0;
	bookmark.top = common.isiOS7? '65dp':'45dp';
	bookmark.zIndex = 50;
	win.add(bookmark);
	
	var contrast = Titanium.UI.createImageView({
		right:'105dp',
		image: 'images/nighttime_inactive.png',
		zIndex: 2,
		height: '32dp',
		width: '32dp',
		bubbleParent: false,
	});
	
	contrast.addEventListener('touchstart', function(){
		if (daytime)
			contrast.image = 'images/nighttime_active.png';
		else
			contrast.image = 'images/daytime_active.png';
	});
	
	contrast.addEventListener('touchend', function(){
		if (daytime){
			contrast.image = 'images/daytime_inactive.png';
			localWebview.evalJS('nighttime();');
		}
		else{
			contrast.image = 'images/nighttime_inactive.png';
			localWebview.evalJS('daytime();');
		}
		daytime = !daytime;
	});
	
	var textsize = Titanium.UI.createImageView({
		right:'55dp',
		image: 'images/textsize_inactive.png',
		zIndex: 2,
		height: '32dp',
		width: '32dp',
		bubbleParent: false,
	});	
		
	textsize.addEventListener('click',function(e){
		if (localWebview.textSize == 0){
			localWebview.evalJS('med();');
			localWebview.textSize = 1;
			localWebview.pinching = 15;
		}
		else if (localWebview.textSize == 1){
			localWebview.evalJS('inc();');
			localWebview.textSize = 2;
			localWebview.pinching = 24;
		}
		else if (localWebview.textSize == 2){
			localWebview.evalJS('dec();');
			localWebview.textSize = 0;
			localWebview.pinching = 10;
		}
	});
	
	textsize.addEventListener('touchstart', function(){
		textsize.image = 'images/textsize_active.png';
	});
	
	textsize.addEventListener('touchend', function(){
		textsize.image = 'images/textsize_inactive.png';
	});
	
	var share = Titanium.UI.createImageView({
		right: '5dp',
		image: 'images/social_share_inactive.png',
		zIndex: 2,
		height: '32dp',
		width: '32dp',
		bubbleParent: false,
	});
	
	share.addEventListener('touchstart', function(){
		share.image = 'images/social_share_active.png';
	});
	
	share.addEventListener('touchend', function(){
		share.image = 'images/social_share_inactive.png';
	});
	
	if (osname == 'android'){
		
		share.addEventListener('click',function(){      
			var activity = Ti.Android.currentActivity;
			var intent = Ti.Android.createIntent({
			            action: Ti.Android.ACTION_SEND,
			            type: 'text/plain'
			        });
			
			intent.putExtra(Ti.Android.EXTRA_TEXT, url);
			intent.putExtra(Ti.Android.EXTRA_DONT_KILL_APP, 1);
			intent.putExtra(Ti.Android.EXTRA_SUBJECT, title);
			activity.startActivity(Ti.Android.createIntentChooser(intent,'Share via'));	
		});
		
		header.add(share);
		header.add(textsize);
		header.add(contrast);
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
		
		textsize.right = '47dp';
		textsize.center = {y: common.isiOS7()? '45dp':'25dp'};
		contrast.right ='92dp';
		contrast.center = {y: common.isiOS7()? '45dp':'25dp'};
		share.right = '4dp';
		share.center = {y: common.isiOS7()? '45dp':'25dp'};

		
		
		/*options = Ti.UI.createView({
			backgroundColor: 'black',
			opacity: 0.9,
			width: '112dp',
			height: '32dp',		
			bottom: '10dp',
			borderRadius: '5dp',
			zIndex: 60,
			isVisible: true,
		});
		*/
		/*win.addEventListener('click', function(){
			alert('tapped');
			if (options.isVisible)
				options.animate({opacity: 0, duration: 1000}, function(){options.isVisible = false;});
			else
				options.animate({opacity: 0.9, duration: 1000}, function(){options.isVisible = true;});
		});*/
		
		header.add(textsize);
		header.add(contrast); 
		header.add(share);
		
	}

};

loadDetail();
activityIndicator.hide();

/*if (osname != 'android'){
	win.add(options);
}*/
//overlay.add(localWebview);
win.add(localWebview);

// if (cache.exists(articleId)){
	// content = cache.getContent(articleId);
	// loadDetail();
	// localWebview.html = content;
	// activityIndicator.hide();
	// win.add(localWebview);
// }
// 
// else{
	// var loader = Ti.Network.createHTTPClient({Timeout:1000});
	// loader.open('GET', 'http://dndev.staging.wpengine.com/?json=get_post&post_id=' + articleId + '&dev=1&include=content');
	// loader.onload = function(){
		// var response = JSON.parse(this.responseText);
		// content = response.post.content;
		// cache.insert(articleId, content, date);
		// loadDetail();
		// localWebview.html = content;
		// activityIndicator.hide();
		// win.add(localWebview);
	// }
// 	
	// if (osname == 'android'){
// 		
	// }
	// loader.onerror = function(){
		// if (osname == 'android'){
// 
			// var title = 'Couldn\'t fetch your articles';
			// var msg = 'Please check internet connectivity';
// 			
			// var notification = Titanium.UI.createNotification({
				// message: title + '\n' + msg,
				// duration: Ti.UI.NOTIFICATION_DURATION_LONG,
			// }) 
// 		
			// notification.addEventListener('click',function(){
				// notification.hide();
			// });
			// notification.show();
		// }
		// else{
			// title = 'Couldn\'t fetch your articles';
			// msg = 'Please check internet connectivity';
// 			
			// var dialog = Ti.UI.createAlertDialog({
				// message: msg,
				// title: title,
				// ok: 'Got it!',
				// cancel: -1,
			// })
			// dialog.show();
		// }
	// }
	// loader.send();
// }

