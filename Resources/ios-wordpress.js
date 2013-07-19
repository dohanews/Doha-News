Ti.include('admob-android.js');
Ti.include('ios-refresh.js');
var common = require('ios-common');
var db = require('database');

var osname = Ti.Platform.osname;

var win = Ti.UI.currentWindow;

var table_rows = {};
var articleData = [];

var firstAd = 0;
var lastAd = 3;

var lastID = 0;
var recentID = 0;

var loadOlderArticles = false;
var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;


var infinite_scroll = function(evt) {
	if (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height){
		loadOlderArticles = true;       
	}
};

var create_activity_indicator = function(){

	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
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

var header = common.create_header();

var toggle_tab_search = function(e){
	if (e.contentOffset.y > 0 && e.contentOffset.y + e.size.height < e.contentSize.height){
		if(e.contentOffset.y > offset){
			offset = e.contentOffset.y;
			if (Ti.App.tabgroupVisible){
				Ti.App.tabgroup.animate({bottom: '-50dp', duration: 250});
				Ti.App.tabgroupVisible = false;
			}
			if(searchBar.isVisible){
				searchBar.animate({top:0,duration:250});
				this.animate({top:'45dp',duration:250});
				searchBar.blur();
				searchBar.isVisible = false;
			}
		}
		else if (e.contentOffset.y < offset){
			offset = e.contentOffset.y;
			if (!Ti.App.tabgroupVisible){
				Ti.App.tabgroup.animate({bottom: 0, duration: 250});
				Ti.App.tabgroupVisible = true;
			}
			if(!searchBar.isVisible){
				searchBar.animate({top:'45dp',duration:250});
				this.animate({top:'90dp',duration:250});
				searchBar.blur();
				searchBar.isVisible = true;
			}
		}
	}
};

var tbl = common.create_table_view();

tbl.addEventListener('scroll', toggle_tab_search);
tbl.addEventListener('scroll', function(e) {
	if(!!current_row){
		current_row.articleRow.animate({
			left: 0,
			duration: 500
		});
		current_row = null;	
	}	
});
tbl.addEventListener('scroll', infinite_scroll);
add_pull_to_refresh(tbl);

Ti.include('ios-search.js');
Ti.include('ios-sharing.js');

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
			
			var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified);
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
	}
	
	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);
			
	loading_indicator.show();
	
	loader.onerror = function(e){
		network.removeEventListener('change', send_request);
		common.dialog('Couldn\'t fetch your articles', 'Please check internet connectivity');
		loading_indicator.hide();
	};

	loader.send();
}

setTimeout(function checkSync() {

    if (loadOlderArticles == false || !Ti.Network.online) {
        setTimeout(checkSync, 500);
        return;
    }
    
	tbl.removeEventListener('scroll',infinite_scroll);
	 
	tbl.appendRow(create_loading_row());

    loadOlderArticles = false;	
    
	var loader = Titanium.Network.createHTTPClient({
		timeout: 10000,
	});

	loader.open("GET","http://dndev.staging.wpengine.com/api/adjacent/get_previous_posts/?dev=1&id="+parseInt(lastID,10));
	
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
			var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified);
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

    setTimeout(checkSync, 500);
}, 500);

Ti.UI.currentTab.addEventListener('blur', function(){
	if (!!current_row){
		current_row.articleRow.animate({
				left: 0,
				duration: 500
		});
		current_row = null;
	}
});

win.add(header);
win.add(searchBar);
win.open();
loadWordpress();
