Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');

var db = require('database');
var osname = Ti.Platform.osname;

var twitter_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: Ti.App.Properties.getString('twitterAccessTokenKey'),
  accessTokenSecret: Ti.App.Properties.getString('twitterAccessTokenSecret'),
});

var win = Titanium.UI.currentWindow;

var lastID = 0;
var recentID = 0;

var loadData = false;
var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;

var infinite_scroll = function(evt) {
	    
	if(evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height) {
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

var topLogo = Titanium.UI.createImageView({
	image:'images/logo.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	left: 0,
	zIndex: 3
});

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

Ti.include('ios-sharing.js');


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
		
	var titleLabel = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		top: '10dp',
		left: '100dp',
		right: '20dp',
		height: Ti.UI.SIZE,
		font: {
			fontSize: Titanium.Platform.displayCaps.platformHeight/30,
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
	
	row.addEventListener('swipe', sharing_animation);
	
	row.articleRow.addEventListener ('click', function(e){
		var win = Ti.UI.createWindow({
			backgroundColor:'#fff',
			url: 'detail.js',
			modal: true
		})
		win.content = content;
		win.open({
			animated:true,
		});
		
		if (!!current_row) {
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
			current_row = null;
		}
	});
	
	
	return row;
}

function loadBookmarks(){
	var articleData = [];
	
	var results = db.getAll();
	
	if (results.length > 0)
		recentID = results[0].id;
		
	for (i = 0; i<results.length; i++)
	{	
		var articleContent = results[i].content; // The tweet message
		var articleTitle = results[i].title; // The screen name of the user
		var author = results[i].author;
		var id = results[i].id;
		var url = results[i].url;
		var date = results[i].date;
		var thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";	
		lastID = id;		
		
		var originalDate = date.split(' ');
		var dateArray = originalDate[0].split('-');
	
		var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
		articleData.push(articleRow);
	}

	tbl.setData(articleData);
}

function initialize_table()
{
	loadBookmarks();
	
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
	
	
	tbl.addEventListener('scroll', function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
			current_row = null;
		}
	});
	
	tbl.addEventListener('click', function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
			current_row = null;
		}
	});

	tbl.addEventListener('scroll', infinite_scroll);	
	
	win.add(tbl);
	win.open();
}

win.add(topBar);

// topBar.add(topLogo);
initialize_table();

Ti.UI.currentTab.addEventListener('focus', function(){
	if (Ti.App.bookmarksChanged){
		loadBookmarks();
		Ti.App.bookmarksChanged = false;
	}
});

Ti.UI.currentTab.addEventListener('blur', function(){
	if (!!current_row) {
		current_row.articleRow.animate({
			left: 0,
			duration: 500
		});
		current_row = null;
	}
});