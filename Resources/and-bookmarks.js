Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');
Ti.include('and-common.js');
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

var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;

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

var header = create_header();

var tbl = create_table_view();

Ti.include('and-sharing.js');

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
	
	tbl.setData(null);
	tbl.setData(articleData);
}

function initialize_table()
{
	tbl.addEventListener('scroll', function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
			current_row = null;
		}
	});
	
	tbl.addEventListener('singletap', function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
			current_row = null;
		}
	});

	tbl.addEventListener ('singletap', function(e){

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
			opacity: 1,
			duration: 500
		});
		current_row = null;
	}
});