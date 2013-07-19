Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');
Ti.include('and-common.js');

var win = Ti.UI.currentWindow;

var db = require('database');
var osname = Ti.Platform.osname;

var twitter_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: Ti.App.Properties.getString('twitterAccessTokenKey'),
  accessTokenSecret: Ti.App.Properties.getString('twitterAccessTokenSecret'),
});

var table_rows = {};
var articleData = [];

var firstAd = 0;
var lastAd = 3;

var lastID = 0;
var recentID = 0;

var loadMoreArticles = false;
var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;


var infinite_scroll = function(evt) {

	if (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) {
		tbl.removeEventListener('scroll', infinite_scroll);	
		loadMoreArticles = true;       
	}
};

var create_activity_indicator = function(){
	
	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.ActivityIndicatorStyle.DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	return activityIndicator;
};

var create_loading_row = function(){
	var loading_row = Ti.UI.createTableViewRow({
		height: '90dp',
		backgroundColor:'transparent',
		width: Ti.Platform.displayCaps.platformWidth,
	});

	var loading_indicator = create_activity_indicator();
	loading_indicator.top = '35dp'
	loading_row.add(loading_indicator);
	loading_indicator.show();
	
	return loading_row;
};

var header = create_header();
var tbl = create_table_view();

tbl.addEventListener('scroll', function(e) {	
	if (!!current_row){
		current_row.articleRow.animate({
				opacity:1,
				duration: 500
		});
		current_row = null;
	}
});

tbl.addEventListener('scroll', infinite_scroll);	
Ti.include('and-refresh.js');
Ti.include('and-sharing.js');
Ti.include('and-search.js');


win.activity.onCreateOptionsMenu = function(e) {
	var menu = e.menu;
	var menuItem = menu.add({
		title: 'Search',
		itemId: 1,
		icon: Ti.Android.R.drawable.ic_menu_search,
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS, 
	});

	menuItem.addEventListener('click',function(e){
		show_searchBar();	
	})
};

function loadWordpress()
{
	var network = Titanium.Network;
	var send_request = function(e){
		if (e.online){
			network.removeEventListener('change', send_request);
			loader.open("GET","http://dndev.staging.wpengine.com/?json=1&count=10");
			loading_indicator.show();
			loader.send();
		}
	}
	
 	articleData = [];
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient({
		timeout: 10000,
	});
	// Sets the HTTP request method, and the URL to get data from

	loader.open("GET","http://dndev.staging.wpengine.com/?json=1&count=10");
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
			var modified = wordpress.posts[i].modified;
			lastID = id;

			var thumbail;

			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = 'images/default_thumb.png';

			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified);
			table_rows[id] = articleRow;

			articleData.push(articleRow);

			if (lastAd%10 == 0 && lastAd != 0) {
				var adMobRow = createAdMobView();
				articleData.push(adMobRow);
			}
		}

		tbl.setData(articleData);
		loading_indicator.hide();
		win.add(tbl);
		win.add(refreshButton);

	}

	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);

	loading_indicator.show();

	loader.onerror = function(e){
		network.addEventListener('change', send_request);
		dialog('Couldn\'t fetch your articles', 'Please check internet connectivity');
		loading_indicator.hide();
	};
	
	loader.send();
}

setTimeout(function load_more_articles() {

    if (loadMoreArticles == false || !Ti.Network.online) {
        setTimeout(load_more_articles, 500);
        return;
    }
    
    tbl.removeEventListener('scroll',infinite_scroll);

	tbl.appendRow(create_loading_row());

    loadMoreArticles = false;	
    
	var loader = Titanium.Network.createHTTPClient({
		timeout: 10000,
	});

	loader.open("GET","http://dndev.staging.wpengine.com/api/adjacent/get_previous_posts/?id="+parseInt(lastID,10));

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
			var modified = wordpress.posts[i].modified;
			
			lastID = id;

			var thumbail;

			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = 'images/default_thumb.png';
				
			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified);
			table_rows[id] = articleRow;
			tbl.appendRow(articleRow);

			if (lastAd%10 == 0 && lastAd != 0) {
				var adMobRow = createAdMobView();
				tbl.appendRow(adMobRow);
			}
		}
		
		articleData = tbl.data;
		tbl.addEventListener('scroll',infinite_scroll);
	}

	loader.onerror = function(e){
		tbl.deleteRow(tbl.data[0].rows.length-1);
		tbl.addEventListener('scroll',infinite_scroll);
	};
	
	loader.send();

    setTimeout(load_more_articles, 500);
}, 500);

Ti.UI.currentTab.addEventListener('blur', function(){
	if (!!current_row){
		current_row.articleRow.animate({
				opacity:1,
				duration: 500
		});
		current_row = null;
	}
	searchBar.blur();
});

//win.add(header);
//header.add(searchBar);
loadWordpress();
win.open();