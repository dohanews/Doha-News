Ti.include('and-common.js');

var win = Ti.UI.currentWindow;

var db = require('database');
var osname = Ti.Platform.osname;

var table_rows = {};
var articleData = [];
var content_loaded = false;

var firstAd = 0;
var lastAd = 3;

var lastID = 0;
var recentID = 0;

var loadMoreArticles = false;
var offset = 0;

// win.backgroundColor='white';
// win.navBarHidden = true;

var infinite_scroll = function(evt) {

	if (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3) {
		tbl.removeEventListener('scroll', infinite_scroll);	
		loadMoreArticles = true;
	}
};

var create_activity_indicator = function(){
	
	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.ActivityIndicatorStyle.BIG_DARK,
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
		//indicator: create_activity_indicator(),
	});

	//loading_row.indicator.top = '35dp'
	//loading_row.add(loading_row.indicator);
	var label = Titanium.UI.createLabel({
			text: 'Fetching older articles...',
			color: 'darkgray',
			font:{
				fontSize: '14dp',
				fontStyle: 'italic',
				fontFamily: 'droidsans',
			}
	});
	
	loading_row.add(label);
	
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

var reComputeTableRowsSize = function(){
	
	var tableData = tbl.data[0];

	if (Ti.Gesture.landscape){
		for (i = 0; i < tableData.rowCount; i++){
			if (tableData.rows[i].className !== 'article')
				continue;
			tableData.rows[i].height = '120dp';
			tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
			tableData.rows[i].content_view.height = '120dp';
			tableData.rows[i].text_view.left = '115dp';
			tableData.rows[i].text_view.height = '100dp';
			tableData.rows[i].title_label.font = {fontSize: '20dp', fontFamily: 'droidsans', fontWeight: 'bold'};
			tableData.rows[i].thumb.width = '100dp';
			tableData.rows[i].thumb.height = '100dp';
			tableData.rows[i].sharing.social.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.bookmark.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
		}
	}
	else{
		for (i = 0; i < tableData.rowCount; i++){
			if (tableData.rows[i].className !== 'article')
				continue;
			tableData.rows[i].height = '100dp';
			tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
			tableData.rows[i].content_view.height = '100dp';
			tableData.rows[i].text_view.left = '95dp';
			tableData.rows[i].text_view.height = '80dp';  
			tableData.rows[i].title_label.font = {fontSize: '17dp', fontFamily: 'droidsans', fontWeight: 'bold'};
			tableData.rows[i].thumb.width = '80dp';
			tableData.rows[i].thumb.height = '80dp';
			tableData.rows[i].sharing.social.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.bookmark.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
		}
	}
};

Ti.include('and-refresh.js');
Ti.include('and-sharing.js');
Ti.include('and-search.js');

tbl.addEventListener('scroll', infinite_scroll);
tbl.addEventListener('scroll', remove_searchView);

Ti.App.tabgroup.activity.onCreateOptionsMenu = function(e) {
	var menu = e.menu;

	var submitItem = menu.add({
		title: 'Submit',
		itemId: 3,
		icon: 'images/submit2.png',
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS, 
	});
	
	submitItem.addEventListener('click', function(){
		var submitWindow = Ti.UI.createWindow({
			backgroundColor:'white',
			url: 'upload_photo.js',
			modal: false,
			//navBarHidden: true,
		});
		
		submitWindow.addEventListener('open', function(e) {
			setTimeout(function(){
			var actionBar = submitWindow.getActivity().actionBar;
				if (actionBar){
					actionBar.title = "Submit";
					actionBar.displayHomeAsUp = true;
					actionBar.onHomeIconItemSelected = function() {
						submitWindow.close();
					};
				}
			}, 200);
		});
		
		submitWindow.open({
			animated:true,
		});	
	});
	
	var searchItem = menu.add({
		title: 'Search',
		itemId: 1,
		icon: 'images/search.png',
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS, 
	});

	searchItem.addEventListener('click',function(e){
		if (Ti.App.tabgroup.activeTab.id != 1){
			Ti.App.tabgroup.setActiveTab(1);
		}
		toggle_searchView();	
	});
	
	var refreshItem = menu.add({
		title: 'Refresh',
		itemId: 2,
		icon: 'images/refresh.png',
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS, 
	});
	
	refreshItem.addEventListener('click', function(){
		if (Ti.App.tabgroup.activeTab.id == 1){
			Ti.App.refreshArticles();
		}
		else if (Ti.App.tabgroup.activeTab.id == 2){
				Ti.App.load_new_photos();
		}
		else{
			Ti.App.refresh_bookmarks();
		}
	});

};

function loadWordpress()
{
	var network = Titanium.Network;
	var send_request = function(e){
		if (e.online){
			network.removeEventListener('change', send_request);
			loader.open("GET","http://dohanews.co/?json=1&count=10");
			loading_indicator.show();
			loader.send();
		}
	};
	
 	articleData = [];
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient({
		timeout: 10000,
	});
	// Sets the HTTP request method, and the URL to get data from

	loader.open("GET","http://dohanews.co/?json=1&count=9");
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

			if (wordpress.posts[i].thumbnail_images && wordpress.posts[i].thumbnail_images.thumbnail)
				thumbnail = wordpress.posts[i].thumbnail_images.thumbnail.url;
			else if (wordpress.posts[i].attachments.length > 0 && wordpress.posts[i].attachments[0].images && wordpress.posts[i].attachments[0].images.thumbnail)
				thumbnail = wordpress.posts[i].attachments[0].images.thumbnail.url;
			else
				thumbnail = 'images/default_thumb.png';

			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified, true);
			table_rows[id] = articleRow;

			articleData.push(articleRow);
		}

		tbl.setData(articleData);
		loading_indicator.hide();
		win.add(tbl);
		Ti.Gesture.addEventListener('orientationchange', reComputeTableRowsSize);
		content_loaded = true;
	};

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

	var loading_row = create_loading_row(); 
	tbl.appendRow(loading_row);
	
    loadMoreArticles = false;	
    
	var loader = Titanium.Network.createHTTPClient({
		timeout: 15000,
	});

	loader.open("GET","http://dohanews.co/api/adjacent/get_previous_posts/?id="+parseInt(lastID,10));
	
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

			if (wordpress.posts[i].thumbnail_images && wordpress.posts[i].thumbnail_images.thumbnail)
				thumbnail = wordpress.posts[i].thumbnail_images.thumbnail.url;
			else if (wordpress.posts[i].attachments.length > 0 && wordpress.posts[i].attachments[0].images && wordpress.posts[i].attachments[0].images.thumbnail)
				thumbnail = wordpress.posts[i].attachments[0].images.thumbnail.url;
			else
				thumbnail = 'images/default_thumb.png';
				
			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified, true);
			table_rows[id] = articleRow;
			tbl.appendRow(articleRow);

			if (lastAd%10 == 0 && lastAd != 0) {
				//var adMobRow = createAdMobView();
				//tbl.appendRow(adMobRow);
			}
		}
		
		articleData = tbl.data;
		tbl.addEventListener('scroll',infinite_scroll);
	};

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
});

loadWordpress();

win.addEventListener('focus', function(){
	if (content_loaded){
		reComputeTableRowsSize();
		Ti.Gesture.addEventListener('orientationchange', reComputeTableRowsSize);
	}
});

win.addEventListener('blur', function(){
	Ti.Gesture.removeEventListener('orientationchange', reComputeTableRowsSize);
});