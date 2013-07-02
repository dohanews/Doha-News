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

var win = Titanium.UI.currentWindow;
win.navBarHidden = true;

var lastID = 0;
var recentID = 0;

var loadData = false;
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
			if(e.size.height < e.contentSize.height && !Ti.App.tabgroupVisible)
			{
				Ti.App.tabgroup.animate({bottom: 0, duration: 250});
				Ti.App.tabgroupVisible = true;
			}
		});
	}
	
	tbl.addEventListener('scroll', function(e) {
		scrolled_times++;
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
	
	win.add(tbl);
	win.open();
}

win.add(topBar);

Ti.UI.currentTab.addEventListener('focus', function(){
	loadBookmarks();
});

// topBar.add(topLogo);
initialize_table();
