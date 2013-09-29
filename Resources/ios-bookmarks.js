Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('admob-android.js');

var common = require('ios-common');
var db = require('database');

var osname = Ti.Platform.osname;

var win = Titanium.UI.currentWindow;

var lastID = 0;
var recentID = 0;

var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;

var create_activity_indicator = function(){

	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
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


var create_no_bookmarks_row = function(){
		var row = Titanium.UI.createTableViewRow({
			height: '45dp',
			backgroundColor:'transparent',
			width: Ti.Platform.displayCaps.platformWidth,
		});
		
		var label = Titanium.UI.createLabel({
			text: 'You haven\'t bookmarked anything yet!',
			color: 'darkgray',
			font:{
				fontSize: '14dp',
				fontStyle: 'italic',
				fontFamily: 'Helvetica',
			}
		});
		row.add(label);
		return row;
};

var header = common.create_header();
var tbl = common.create_table_view('45dp');

var reComputeTableRowsSize = function(){
	
	var tableData = tbl.data[0];

	if (Ti.Gesture.landscape){
		for (i = 0; i < tableData.rowCount; i++){
			if (tableData.rows[i].className !== 'article')
				continue;
			tableData.rows[i].height = '110dp';
			tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
			tableData.rows[i].content_view.height = '110dp';
			tableData.rows[i].text_view.left = '105dp';
			tableData.rows[i].text_view.height = '90dp';
			tableData.rows[i].title_label.font = {fontSize: '18dp', fontFamily: 'Helvetica-Bold'};
			tableData.rows[i].thumb.width = '90dp';
			tableData.rows[i].thumb.height = '90dp';
			tableData.rows[i].sharing.facebook.center = {x: 0.2 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.twitter.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.email.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.bookmark.center = {x: 0.8 * Ti.Platform.displayCaps.platformWidth};
		}
	}
	else{
		for (i = 0; i < tableData.rowCount; i++){
			if (tableData.rows[i].className !== 'article')
				continue;
			tableData.rows[i].height = '90dp';
			tableData.rows[i].content_view.width = Ti.Platform.displayCaps.platformWidth;
			tableData.rows[i].content_view.height = '90dp';
			tableData.rows[i].text_view.left = '85dp';
			tableData.rows[i].text_view.height = '90dp';  
			tableData.rows[i].title_label.font = {fontSize: '15dp', fontFamily: 'Helvetica-bold'};
			tableData.rows[i].thumb.width = '70dp';
			tableData.rows[i].thumb.height = '70dp';
			tableData.rows[i].sharing.facebook.center = {x: 0.2 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.twitter.center = {x: 0.4 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.email.center = {x: 0.6 * Ti.Platform.displayCaps.platformWidth};
			tableData.rows[i].sharing.bookmark.center = {x: 0.8 * Ti.Platform.displayCaps.platformWidth};
		}
	}
};

Ti.include('ios-sharing.js');

function loadBookmarks(){
	var articleData = [];
	
	var results = db.getAll();
	
	if (results.length > 0)
		recentID = results[0].id;
	else
		articleData.push(create_no_bookmarks_row());
		
	for (i = 0; i<results.length; i++)
	{	
		var articleContent = results[i].content;
		var articleTitle = results[i].title;
		var author = results[i].author;
		var id = results[i].id;
		var url = results[i].url;
		var date = results[i].date;
		var thumbnail = results[i].thumbnail;
		lastID = id;	
	
		var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
		articleData.push(articleRow);
	}

	tbl.setData(articleData);
}

function initialize_table()
{
	loadBookmarks();
	
	tbl.addEventListener('scroll', function(e){
		console.log(" " + e.contentSize.height + ' ' + Ti.Platform.displayCaps.platformHeight);
		if (e.contentOffset.y > 0 && 
			e.contentOffset.y + e.size.height < e.contentSize.height &&
			e.contentSize.height > Ti.Platform.displayCaps.platformHeight - 45){
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
	
	if (tbl.data[0]){
		reComputeTableRowsSize();
		Ti.Gesture.addEventListener('orientationchange', reComputeTableRowsSize);
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
	
	Ti.Gesture.removeEventListener('orientationchange', reComputeTableRowsSize);
});
