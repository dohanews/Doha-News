Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');

var common = require('ios-common');
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

var header = common.create_header();
var tbl = common.create_table_view('45dp');

Ti.include('ios-sharing.js');

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
	
		var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
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

win.add(header);
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