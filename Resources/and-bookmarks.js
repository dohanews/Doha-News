Ti.include('and-common.js');
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
		style: Ti.UI.ActivityIndicatorStyle.DARK,
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
				fontFamily: 'droidsans',
			}
		});
		row.add(label);
		return row;
};

var tbl = create_table_view();

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

Ti.include('and-sharing.js');

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
	
		var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
		articleData.push(articleRow);
	}
	
	tbl.setData(null);
	tbl.setData(articleData);
	Ti.Gesture.addEventListener('orientationchange', reComputeTableRowsSize);
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
		
	win.add(tbl);
}

initialize_table();

Ti.UI.currentTab.addEventListener('focus', function(){
	if (Ti.App.bookmarksChanged){
		loadBookmarks();
		Ti.App.bookmarksChanged = false;
	}

	// Ti.App.tabgroup.getActivity().onPrepareOptionsMenu = function(e){
		// var menu = e.menu;
		// menu.findItem(1).visible = false;
		// menu.findItem(2).visible = false;
	// }
// 	
	// Ti.App.tabgroup.activity.invalidateOptionsMenu();
});

Ti.UI.currentTab.addEventListener('blur', function(){
	if (!!current_row) {
		current_row.articleRow.animate({
			opacity: 1,
			duration: 500
		});
		current_row = null;
	}
	
	Ti.Gesture.removeEventListener('orientationchange', reComputeTableRowsSize);
});

win.addEventListener('focus', function(){
	if (tbl.data[0]){
		reComputeTableRowsSize();
		Ti.Gesture.addEventListener('orientationchange', reComputeTableRowsSize);
	}
});

Ti.App.refresh_bookmarks = function(){
	for (i = 0; i < tbl.data[0].rows.length; i++){
		if (tbl.data[0].rows[i].id){
			var result = db.get(tbl.data[0].rows[i].id);
			tbl.data[0].rows[i].date_label.text = get_relative_time(result.date);
			tbl.data[0].rows[i].thumb.image = result.thumbnail;
		}
	}
};
