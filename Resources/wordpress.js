Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');
Ti.include('search.js');

var fb = require('facebook');
fb.appid = "520290184684825";
fb.permissions = ['publish_stream', 'offline_access']; // Permissions your app needs
fb.forceDialogAuth = true;
facebookToken = fb.accessToken;

var client = Twitter({
  consumerKey: "dA16PByC2iPsc30GgFh1ng",
  consumerSecret: "XQcDIrp5wBte8esPbCvJhX830vf3ut4NV4ucwgSRs"
});

var accessTokenKey = Ti.App.Properties.getString('twitterAccessTokenKey')
var accessTokenSecret = Ti.App.Properties.getString('twitterAccessTokenSecret') 

var firstAd = 0;
var lastAd = 3;

var osname = Ti.Platform.osname;
var isAndroid = Ti.Platform.osname === 'android';

var lastID = 0;
var recentID = 0;

var loadData = false;
var refreshing = false;

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';
win.navBarHidden = true;


var scrollingFunction = function(evt) {
	    
	if (isAndroid && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3)
	|| (!isAndroid && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {

		if (isAndroid)
			tbl.removeEventListener('scroll', scrollingFunction);
			
		loadData = true;       
	}
};

var scrollingFunction = function(evt) {
	    
	if (isAndroid && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3)
	|| (!isAndroid && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {

		if (isAndroid)
			tbl.removeEventListener('scroll', scrollingFunction);
			
		loadData = true;       
	}
};

var create_activity_indicator = function(){
	var style;
	if (Ti.Platform.name === 'iPhone OS'){
		style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
	}
	else {
		style = Ti.UI.ActivityIndicatorStyle.DARK;
	}

	var activityIndicator = Ti.UI.createActivityIndicator({
		style: style,
		center:{x:Ti.Platform.displayCaps.platformWidth/2, 
			y:Ti.Platform.displayCaps.platformHeight/2},
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});
	
	return activityIndicator;
};


var create_loading_row = function(){
	var loading_row = Ti.UI.createTableViewRow({
		height: Ti.UI.SIZE,
		backgroundColor:'transparent',
		width: Ti.Platform.displayCaps.platformWidth,
	});

	var loading_indicator = create_activity_indicator();
	loading_indicator.top = '40dp';
	
	loading_row.add(loading_indicator);
	loading_indicator.show();
	
	return loading_row;
};


var post_to_facebook = function(title, url){
	fb.addEventListener('login', function(e) {
	    if (e.success) {
			console.log('Logged In');
			Ti.App.fbLoggedIn = true;
			fb.dialog('feed', 
			{
				link: url,
				name: title
			},
			function(){
				alert('posted');
			});
	    } else if (e.error) {
	        alert(e.error);
	    } else if (e.cancelled) {
	        alert("Cancelled");
	    }
	});

	fb.authorize();		
};

var create_facebook_share = function(title, url){
	
	var facebook_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '10dp',
		height: '50dp',
		image: 'images/facebook.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	facebook_icon.addEventListener('click',function(e){
		
		alert('wp.js: ' + Ti.App.fbLoggedIn );
		if (!Ti.App.fbLoggedIn)
		{
			if(fb.getLoggedIn())
			{
				fb.addEventListener('logout', function(e) {
					
					var client = Titanium.Network.createHTTPClient();
					client.clearCookies('https://login.facebook.com');
					post_to_facebook(title, url);
								
				});
				fb.logout();
			}
			else
			{
				post_to_facebook(title, url);
			}
		}
		else
		{
			fb.dialog('feed', 
				{
					link: url,
					name: title
				},
				function(){
					alert('posted');
				});
		}
	});	
	
	return facebook_icon;
};

var create_twitter_share = function(title, url){
	
	var twitter_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '90dp',
		height: '50dp',
		image: 'images/twitter.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	twitter_icon.addEventListener('click',function(e){	
		alert('tweet article'), console.log('twitter icon clicked')
	});
	
	return twitter_icon;
};

var create_email_share = function(title, url){
	
	var email_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '170dp',
		height: '50dp',
		image: 'images/mail.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	email_icon.addEventListener('click',function(e){	
		var emailDialog = Ti.UI.createEmailDialog({
			subject: title,
			messageBody: url,
		});
		emailDialog.open();
	});
	
	return email_icon;
};


var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height: '0.75cm',
	top: 0,
});

var textViewButton = Titanium.UI.createImageView({
	image:'images/text-view.png',
	right: '95dp', 
	width: '30dp',
	height: '30dp',
	top: '10dp',
	zIndex: 3
});

// var searchButton = Titanium.UI.createImageView({
	// image:'images/search.png',
	// right: '135dp', 
	// width: '30dp',
	// height: '30dp',
	// top: '10dp',
	// zIndex: 3
// });

var photoViewButton = Titanium.UI.createImageView({
	image:'images/photoview-ipad.png',
	right: '55dp', 
	width: '30dp',
	height: '30dp',
	top: '10dp',
	zIndex: 3
});

var menuButton = Titanium.UI.createImageView({
	image:'images/menu.png',
	width: '0.75cm',
	height: '0.75cm',
	top: 0,
	right: 0,
	zIndex: 3
});

var topLogo = Titanium.UI.createImageView({
	image:'images/logo.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	left: 0,
	zIndex: 3
});

var menuData = [];

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
		menu_action: i
	});
	
	row.addEventListener('click',function(e){
			if (e.source.menu_action == 0) {
				var win = Ti.UI.createWindow({
		    			backgroundColor:'#fff',
		    			url: 'settings.js',
		    			modal: true
			    })
		    	win.open({
		    		animated:true,
		    	});
			}
			else if (e.source.menu_action == 1) {
			}
			else
			{
				console.log(fb.accessToken);
			}
	});
	row.add(img);
	menuData.push(row);				
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
	zIndex: 2,
	height: Ti.UI.SIZE,
	isVisible : false,
	scrollable: false,
});


menu.setData(menuData);

topBar.addEventListener('click',function(){
	if (menu.isVisible == true){
		menu.animate({
			top: '-210dp', 
			duration: 500,
		});
		menu.isVisible = false;
	}	
});


// function isToday(day, month, year){
	// var currentTime = new Date();
	// var currentDay = currentTime.getDate();
	// var currentMonth = currentTime.getMonth() + 1;
	// var currentYear = currentTime.getFullYear();
// 	
	// if (year<currentYear){
		// return false;
	// }
	// else if (month<currentMonth){
		// return false;
	// }
	// else if (day<currentDay){
		// return false;
	// }
	// return true;
// }


var tbl = Ti.UI.createTableView({
	backgroundColor:'transparent',
	minRowHeight: '95dp',
	top: '.75cm',
	left: '5dp',
	right: '5dp',
	bubbleParent: false,
	selectionStyle: 'none',
	separatorColor: '#d3d3d3',
	zIndex:1,
});


var create_sharing_options_view = function(url, title) { 

	var icons = Ti.UI.createView({
		backgroundColor: 'transparent',
		zIndex: 15,
		bubbleParent: false,
	});
	
	icons.add(create_facebook_share(title,url));
	icons.add(create_twitter_share(title,url));
	icons.add(create_email_share(title,url));
	
	var view = Ti.UI.createView({
		top: '0.75cm',
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor: 'gray',
		opacity: 0.7,
		zIndex: 14,
		bubbleParent: false,
		icons: icons
	});

	return view;
};

var make_content_view = function(title, content, thumbnail, url) {// create the content view - the one is displayed by default
	
	var row = Ti.UI.createTableViewRow({
		height: Ti.UI.SIZE,
		backgroundColor:'#fdfcf8',
		className: 'article',
		url: url,
		content: content,
		articleTitle: title,
		width: Ti.Platform.displayCaps.platformWidth,
	});

	var thumbnail = Ti.UI.createImageView({
		height: '80dp',
		width: '80dp',
		left: '7.5dp',
		borderColor: '#E3E3E3',
		borderWidth: '1dp',
		image: thumbnail,
		touchEnabled: false,
	});
	

	var fontSize;
	if (isAndroid)
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;
	else
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/30;
		
	var titleLabel = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		top: '10dp',
		left: '100dp',
		right: '20dp',
		height: Ti.UI.SIZE,
		touchEnabled: false,
		font: {
			fontSize: fontSize,
		},
		backgroundColor:'transparent',
	});
	
	row.addEventListener('click', function(e){
		if (menu.isVisible == true){
			menu.animate({
				top: '-210dp', 
				duration: 500,
			});
			menu.isVisible = false;
		}
	});
	
	if (isAndroid){
		row.addEventListener('longclick', function(e){
			win.sharing_options = create_sharing_options_view(url, title);
			win.sharing_options.isVisible = true;
			win.add(win.sharing_options);
			win.add(win.sharing_options.icons);
			
	
			win.sharing_options.icons.addEventListener('click',function(){
				win.remove(win.sharing_options);
				win.remove(win.sharing_options.icons);
			});
		});
	}
	
	row.add(thumbnail);
	row.add(titleLabel);
	return row;
}

function loadWordpress()
{
	var loader;
	var articleData = [];
	// Create our HTTP Client and name it "loader"
	loader = Titanium.Network.createHTTPClient();
	// Sets the HTTP request method, and the URL to get data from

	loader.open("GET","http://dev.dohanews.co/?json=1&count=10&dev=1");
	// Runs the function when the data is ready for us to process
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		if (wordpress.posts.length > 0)
			recentID = wordpress.posts[0].id;
			
		for (var i = 0; i < wordpress.posts.length; i++)
		{	
			lastAd++;
			var articleContent = wordpress.posts[i].content; // The tweet message
			var articleTitle = wordpress.posts[i].title; // The screen name of the user
			var url = wordpress.posts[i].url;
			lastID = wordpress.posts[i].id;				
			
			var originalDate = wordpress.posts[i].date.split(' ');
			var date = originalDate[0].split('-');
			
			var thumbail;
			
			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";	

			
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url);

			articleData.push(articleRow);
			
			if (lastAd%10 == 0 && lastAd != 0) {
				var adMobRow = createAdMobView();
				articleData.push(adMobRow);
			}
		}
	
		tbl.setData(articleData);
	}
	
	if (isAndroid) {
	
		var scrolled_times = 0;
	
		tbl.addEventListener('scrollEnd', function(e) {
			scrolled_times = 0;
		});
	
	}
	
	tbl.addEventListener('scroll', function(e) {
		if (menu.isVisible == true && (isAndroid ?  scrolled_times > 3 : true)){
				menu.animate({
					top: '-210dp', 
					duration: 500,
				});
				menu.isVisible = false;
			}	
		scrolled_times++;
	});
	
	tbl.addEventListener('click', function(e) {
		if (menu.isVisible == true){
			menu.animate({
				top: '-210dp', 
				duration: 1000,
			});
			menu.isVisible = false;
		}	
	
	});
	
	if (!isAndroid){
		tbl.addEventListener('longpress', function(e){
			alert (e.source.url);
			win.sharing_options = create_sharing_options_view(e.source.url, e.source.articleTitle);
			win.sharing_options.isVisible = true;
			win.add(win.sharing_options);
			win.add(win.sharing_options.icons);
			
	
			win.sharing_options.icons.addEventListener('click',function(){
				win.remove(win.sharing_options);
				win.remove(win.sharing_options.icons);
			});
		});
	}
	
	var clickEvent = isAndroid? 'singletap':'click';
	
	tbl.addEventListener (clickEvent, function(e){
		if (e.source.className == 'article'){
			var win = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: true
			})
			win.content = e.source.content;
			win.open({
				animated:true,
			});
		}
	});
	
	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);
			
	loading_indicator.show();
		
	win.open();
	
	loader.onreadystatechange = function(e){ 
		if (this.readyState == 4) {
			loading_indicator.hide();
			win.add(tbl);
			tbl.addEventListener('scroll', scrollingFunction);	
		} 
	};
	loader.send();
}

setTimeout(function checkSync() {

    if (loadData == false) {
        setTimeout(checkSync, 500);
        return;
    }
    
    tbl.removeEventListener('scroll',scrollingFunction);
	
	tbl.appendRow(create_loading_row());

    loadData = false;	
    
	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://dev.dohanews.co/api/adjacent/get_previous_posts/?dev=1&id="+parseInt(lastID,10));
	
	loader.onload = function() 
	{
		tbl.deleteRow(tbl.data[0].rows.length-1);
		var wordpress = JSON.parse(this.responseText);
		for (var i = 0; i < wordpress.posts.length; i++)
		{
			lastAd++;
			var articleContent = wordpress.posts[i].content; // The tweet message
			var articleTitle = wordpress.posts[i].title; // The screen name of the user
			var url = wordpress.posts[i].url;
			lastID = wordpress.posts[i].id;
			
			var thumbail;
	
			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";
	
			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url);
			tbl.appendRow(articleRow);
			
			if (lastAd%10 == 0 && lastAd != 0) {
				var adMobRow = createAdMobView();
				tbl.appendRow(adMobRow);
			}
		}
		
		tbl.addEventListener('scroll',scrollingFunction);
	}
	
	loader.send();

    setTimeout(checkSync, 200);
}, 200);

var refresh = function(e){
	if (refreshing){
		return;
	}
	  
	refreshing = true;
	
	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://dev.dohanews.co/api/adjacent/get_next_posts/?dev=1&id="+parseInt(recentID,10));
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length > 0)
			recentID = wordpress.posts[wp_length-1].id;

		for (i = 0; i < wp_length; i++)
		{
			if (firstAd == 0) {
				var adMobRow = createAdMobView();
				tbl.insertRowBefore(0, adMobRow);
				firstAd = 10;
			}
		
			firstAd--;
			var articleContent = wordpress.posts[i].content; // The tweet message
			var articleTitle = wordpress.posts[i].title; // The screen name of the user
			var url = wordpress.posts[i].url;
			
			var thumbail;

			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";

			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url);
			tbl.insertRowBefore(0, articleRow);
		}
		refreshing = false;		
	}
	
	loader.send();
    // and push this into our table.
    // now we're done; reset the loadData flag and start the interval up again
};

var refreshButton = Ti.UI.createButton({
	title: 'R',
	width: '40dp',
	height: '40dp',
});

refreshButton.addEventListener('click', refresh);
// var admobbutt = Ti.UI.createButton({
	// title: 'admob',
	// left: 50,
// });
// 
// admobbutt.addEventListener ('singletap', function(e){
		// var win = Ti.UI.createWindow({
			// backgroundColor:'#fff',
			// url: 'admob-android.js',
			// modal: true
		// })
		// win.open();
	// });

win.add(topBar);
win.add(menu);
//win.add(menuButton);
//topBar.add(admobbutt);
topBar.add(searchButton);
topBar.add(searchParent);
// topBar.add(refreshButton);
// topBar.add(photoViewButton);
// topBar.add(textViewButton);
// topBar.add(searchButton);
// topBar.add(topLogo);

loadWordpress();
