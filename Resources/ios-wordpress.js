Ti.include('admob-android.js');
Ti.include('search.js');

var db = require('database');
var osname = Ti.Platform.osname;

var win = Ti.UI.currentWindow;

var firstAd = 0;
var lastAd = 3;

var lastID = 0;
var recentID = 0;

var loadData = false;
var offset = 0;

win.backgroundColor='white';
win.navBarHidden = true;


var infinite_scroll = function(evt) {
	if (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height){
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
	top: 0,
	height: '0.75cm',
	zIndex: 2
});

var topLogo = Titanium.UI.createImageView({
	image:'images/logo.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	left: 0,
	zIndex: 3
});

var searchBar = Ti.UI.createSearchBar({
	hintText: 'Search',
	barColor : 'silver',
	zIndex: 1,
	top: '0.75cm',
	isVisible: true,
});

function isToday(day, month, year){
	var currentTime = new Date();
	var currentDay = currentTime.getDate();
	var currentMonth = currentTime.getMonth() + 1;
	var currentYear = currentTime.getFullYear();
	
	if (year<currentYear){
		return false;
	}
	else if (month<currentMonth){
		return false;
	}
	else if (day<currentDay){
		return false;
	}
	return true;
}

function get_date_label(date){
	var label;
	var dateTime = date.split(' ');
	var date = originalDate[0].split('-');
	var time = originalDate[1].split(':');
	
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var year = currentTime.getFullYear();
	var month = currentTime.getMonth();
	var day = currentTime.getDay();
	
	if (isToday(date[0], date[1], date[2])){
		if (time[0] == hours){
			if (time[1] == minutes)
				label = 'Just now';
			else{
				diff = Math.abs(time[1] - minutes);
				label = diff == 1? diff + 'minute ago' : diff + 'minutes ago';
			}
		}
		else{
			diff = Math.abs(time[0] - hours);
			label = diff == 1? diff + 'hour ago' : diff + 'hours ago';
		}
	}
	else{
		if (date[0] == years){
			if (date[1] == month){
				diff = Math.abs(date[2] - day);
				label = diff == 1? 'Yesterday' : diff + 'days ago';
			}
			else{
				diff = Math.abs(date[1] - month);
				label = diff == 1? 'Last month' : diff + 'months ago';
			}	
		}
		else{
			diff = Math.abs(date[0] - year);
			label = diff == 1? 'Last year' : diff + 'years ago';
		}	
	}	
}

var tbl = Ti.UI.createTableView({
	backgroundColor:'transparent',
	minRowHeight: '95dp',
	top: '1.5cm',
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
			fontSize: (Titanium.Platform.displayCaps.platformHeight)/30,
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
	
	tbl.addEventListener('scroll', function(e){
		if (e.contentOffset.y > 0 && e.contentOffset.y + e.size.height < e.contentSize.height){
			if(e.contentOffset.y > offset){
				offset = e.contentOffset.y;
				if (Ti.App.tabgroupVisible){
					Ti.App.tabgroup.animate({bottom: -50, duration: 250});
					Ti.App.tabgroupVisible = false;
				}
				if(searchBar.isVisible){
					searchBar.animate({top:0,duration:500});
					tbl.animate({top:'0.75cm',duration:500});
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
					searchBar.animate({top:'0.75cm',duration:500});
					tbl.animate({top:'1.5cm',duration:500});
					searchBar.blur();
					searchBar.isVisible = true;
				}
			}
		}
	});
	
	
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
	
	Ti.include('ios-refresh.js');
	tbl.headerPullView = tableHeader;
	
	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);
			
	loading_indicator.show();
		
	win.open();
	
	loader.onreadystatechange = function(e){ 
		if (this.readyState == this.DONE) {
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

	tbl.removeEventListener('scroll',infinite_scroll);
	 
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
		
		tbl.addEventListener('scroll',infinite_scroll);
	}
	
	loader.send();

    setTimeout(checkSync, 500);
}, 500);


win.add(topBar);
win.add(searchBar);
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
		current_row.articleRow.animate({
				left: 0,
				duration: 500
		});
		current_row = null;
	}
});

loadWordpress();