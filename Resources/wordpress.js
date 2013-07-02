Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');
Ti.include('search.js');

var db = require('database');
var osname = Ti.Platform.osname;
var isAndroid = Ti.Platform.osname === 'android';

var fb = require('facebook');
fb.appid = "520290184684825";
fb.permissions = ['publish_stream', 'offline_access']; // Permissions your app needs
fb.forceDialogAuth = true;
facebookToken = fb.accessToken;

var twitter_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: Ti.App.Properties.getString('twitterAccessTokenKey'),
  accessTokenSecret: Ti.App.Properties.getString('twitterAccessTokenSecret'),
});

var win = Ti.UI.currentWindow;

var firstAd = 0;
var lastAd = 3;

var lastID = 0;
var recentID = 0;

var loadData = false;
var refreshing = false;
var offset = 0;

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
});


Ti.include('sharing.js');

var make_content_view = function(title, content, thumbnail, url, id, date, author) {

	var content_view = Ti.UI.createView({
		height: Ti.UI.FILL,
		width: Titanium.Platform.displayCaps.platformWidth,
		left: 0,
		backgroundColor: 'white',
	})
	
	var thumbnail = Ti.UI.createImageView({
		height: '80dp',
		width: '80dp',
		left: 0,
		borderColor: '#E3E3E3',
		borderWidth: '1dp',
		image: thumbnail,
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
		font: {
			fontSize: fontSize,
		},
		backgroundColor:'transparent',
	});
	
	content_view.add(thumbnail);
	content_view.add(titleLabel);
	
	var row = Ti.UI.createTableViewRow({
		height: Ti.UI.FILL,
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor:'#fff',
		className: 'article',
		url: url,
		content: content,
		articleTitle: title,
		id: id,
		author: author,
		date: date,
	});

	row.articleRow = content_view;
	var sharing = create_sharing_options_view(url, title, content, thumbnail, id, date, author);
	row.add(sharing);
	row.add(row.articleRow);
	
	var share_event = isAndroid? 'longclick':'swipe';
	row.addEventListener(share_event, sharing_animation);
	
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
			var author = wordpress.posts[i].author.name;
			var id = wordpress.posts[i].id;
			var url = wordpress.posts[i].url;
			var date = wordpress.posts[i].date;
			lastID = id;		
			
			var originalDate = date.split(' ');
			var dateArray = originalDate[0].split('-');
			
			var thumbail;
			
			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";	

			
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);

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
	
	if (!isAndroid){
		tbl.addEventListener('scroll', function(e){
			if (e.contentOffset.y > 0 && e.contentOffset.y + e.size.height < e.contentSize.height){
				if(e.contentOffset.y > offset){
					offset = e.contentOffset.y;
					if (Ti.App.tabgroupVisible){
						Ti.App.tabgroup.animate({bottom: -50, duration: 250});
						Ti.App.tabgroupVisible = false;
					}
				}
				else if (e.contentOffset.y < offset){
					offset = e.contentOffset.y;
					if (!Ti.App.tabgroupVisible){
						Ti.App.tabgroup.animate({bottom: 0, duration: 250});
						Ti.App.tabgroupVisible = true;
					}
				}
			}
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
			
		if(!!current_row){
			if (isAndroid)
				current_row.articleRow.animate({opacity: 1});
			else
				current_row.articleRow.animate({left:0});
			current_row = null;	
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

	
	var clickEvent = isAndroid? 'singletap':'click';
	
	tbl.addEventListener(clickEvent, function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
		};
	});
	
	tbl.addEventListener (clickEvent, function(e){

		if (e.rowData.className == 'article'){
			var win = Ti.UI.createWindow({
				backgroundColor:'#fff',
				url: 'detail.js',
				modal: true
			})
			win.content = e.rowData.content;
			win.open({
				animated:true,
			});
		}
	});
	
	tbl.addEventListener('scroll', scrollingFunction);	
	
	if (isAndroid){
		Ti.include('refresh_android.js');
	}
	else{
		Ti.include('refresh_ios.js');
		tbl.headerPullView = tableHeader;
	}
	
	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);
			
	loading_indicator.show();
		
	win.open();
	
	loader.onreadystatechange = function(e){ 
		if (this.readyState == 4) {
			loading_indicator.hide();
			win.add(tbl);
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
			var author = wordpress.posts[i].author.name;
			var id = wordpress.posts[i].id;
			var url = wordpress.posts[i].url;
			var date = wordpress.posts[i].date;
			
			lastID = id;
			
			var thumbail;
	
			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";
	
			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
			tbl.appendRow(articleRow);
			
			if (lastAd%10 == 0 && lastAd != 0) {
				var adMobRow = createAdMobView();
				tbl.appendRow(adMobRow);
			}
		}
		
		tbl.addEventListener('scroll',scrollingFunction);
	}
	
	loader.send();

    setTimeout(checkSync, 500);
}, 500);


win.add(topBar);
win.add(menu);
//win.add(menuButton);
//topBar.add(admobbutt);
//topBar.add(searchButton);
//topBar.add(searchParent);
// topBar.add(photoViewButton);
// topBar.add(textViewButton);
// topBar.add(searchButton);
// topBar.add(topLogo);

Ti.UI.currentTab.addEventListener('blur', function(){
	if (!!current_row){
		if (isAndroid)
			current_row.articleRow.animate({opacity:1, duration:500});
		else
			current_row.articleRow.animate({left:0, duration:500});
	}
});

loadWordpress();


