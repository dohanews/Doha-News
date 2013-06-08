var rotate90 = Ti.UI.create2DMatrix({ rotate: 90 });
var osname = Ti.Platform.osname;

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';
win.navBarHidden = true;

var create_facebook_share = function(title, url){
	
	var facebook_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '10dp',
		height: '50dp',
		image: 'images/facebook.png',
		is_action: i+1,
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	facebook_icon.addEventListener('click',function(e){	
		alert('post to facebook'), console.log('facebook icon clicked')
	});
	
	return facebook_icon;
};

var create_twitter_share = function(title, url){
	
	var twitter_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '90dp',
		height: '50dp',
		image: 'images/twitter.png',
		is_action: i+1,
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	twitter_icon.addEventListener('click',function(e){	
		alert('tweet article'), console.log('twitter icon clicked')
	});
	
	return twitter_icon;
};

var create_email_share = function(title, url){
	
	var email_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '170dp',
		height: '50dp',
		image: 'images/mail.png',
		is_action: i+1,
		url: url,
		opacity: 1,
		bubbleParent: false,
		zIndex:15,
	});
	
	email_icon.addEventListener('click',function(e){	
		var emailDialog = Ti.UI.createEmailDialog({
			subject: title,
			messageBody: url,
		});
		emailDialog.open();
	});
	
	return email_icon;
};


var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height: '0.75cm',
	top: 0
});

var textViewButton = Titanium.UI.createImageView({
	image:'images/text-view.png',
	right: '95dp', 
	width: '30dp',
	height: '30dp',
	top: '10dp',
	zIndex: 3
});

var searchButton = Titanium.UI.createImageView({
	image:'images/search.png',
	right: '135dp', 
	width: '30dp',
	height: '30dp',
	top: '10dp',
	zIndex: 3
});

var photoViewButton = Titanium.UI.createImageView({
	image:'images/photoview-ipad.png',
	right: '55dp', 
	width: '30dp',
	height: '30dp',
	top: '10dp',
	zIndex: 3
});

var menuButton = Titanium.UI.createImageView({
	image:'images/menu.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	right: 0,
	zIndex: 3
});

var topLogo = Titanium.UI.createImageView({
	image:'images/logo.png',
	width: '50dp',
	height: '50dp',
	top: 0,
	left: 0,
	zIndex: 3
});

var data = [];

var opt = ['images/settings.png','images/photos.png','images/videos.png','images/articles.png'];

for (i = 0; i < opt.length; i++)
{
	var row = Ti.UI.createTableViewRow({
				height: Ti.UI.SIZE,
				zIndex: 1,
			});
	
	var img = Ti.UI.createImageView({
		image: opt[i],
		width: '50dp',
		height: '50dp',
		zIndex: 1,
	});

	
	row.addEventListener('click',function(){
		alert(opt[i]);
	});
	row.add(img);
	data.push(row);				
}

menuButton.addEventListener('click', function(e){

	if (menu.isVisible == true){
		menu.animate({
			top: '-210dp', 
			duration: 500,
		});
		menu.isVisible = false;
	}
	else{
		menu.animate({
			top: '.75cm', 
			duration: 500,
		});
		menu.isVisible = true;
	}
});

var menu = Ti.UI.createTableView({
	width: '50dp',
	top: '-210dp', 
	right: '0dp',
	rowHeight: Ti.UI.SIZE,
	separatorColor: 'black',
	backgroundColor:'white',
	zIndex: 2,
	height: Ti.UI.SIZE,
	isVisible : false,
	scrollable: false,
});


menu.setData(data);

topBar.addEventListener('click',function(){
	if (menu.isVisible == true){
		menu.animate({
			top: '-210dp', 
			duration: 500,
		});
		menu.isVisible = false;
	}	
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


var tbl = Ti.UI.createTableView({
	backgroundColor:'white',
	minRowHeight: '95dp',
	top: '.75cm',
	left: '5dp',
	right: '5dp',
	selectionStyle: 'none',
	separatorColor: '#d3d3d3',
	zIndex:1
});

var today = Titanium.UI.createTableViewSection({
    headerTitle:"Today"
});
var old = Titanium.UI.createTableViewSection({
    headerTitle:"Older"
});


// create the actions view - the one will be revealed on swipe
var create_sharing_options_view = function(url, title) { 

	var icons = Ti.UI.createView({
		backgroundColor: 'transparent',
		zIndex: 15,
		bubbleParent: false,
	});
	
	icons.add(create_facebook_share(title,url));
	icons.add(create_twitter_share(title,url));
	icons.add(create_email_share(title,url));
	
	var view = Ti.UI.createView({
		top: '0.75cm',
		width: Ti.Platform.displayCaps.platformWidth,
		backgroundColor: 'gray',
		opacity: 0.7,
		zIndex: 14,
		bubbleParent: false,
		icons: icons
	});

	return view;
};

var make_content_view = function(title, content, thumbnail, url) {// create the content view - the one is displayed by default
		
	var row = Ti.UI.createTableViewRow({
		height: Ti.UI.SIZE,
		backgroundColor:'#fdfcf8',
		//backgroundColor: 'red',
		className: 'article',
		url: url,
		content: content,
		bubbleParent: false,
	});

	var thumbnail = Ti.UI.createImageView({
		height: '80dp',
		width: '80dp',
		left: '7.5dp',
		borderColor: '#E3E3E3',
		borderWidth: '1dp',
		image: thumbnail,
		touchEnabled: false,
	});
	

	var fontSize;
	if (osname == 'android')
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
		touchEnabled: false,
		font: {
			fontSize: fontSize,
		},
		backgroundColor:'transparent',
	});
	
	row.addEventListener('longclick', function(e){
		alert (e.source.url);
		win.sharing_options = create_sharing_options_view(url, title);
		win.sharing_options.isVisible = true;
		win.add(win.sharing_options);
		win.add(win.sharing_options.icons);
		
		win.sharing_options.addEventListener('click',function(){
			win.remove(win.sharing_options);
			win.remove(win.sharing_options.icons);
		});
		win.sharing_options.icons.addEventListener('click',function(){
			win.remove(win.sharing_options);
			win.remove(win.sharing_options.icons);
		});
	});
	
	row.addEventListener('click', function(e){
		if (menu.isVisible == true){
			menu.animate({
				top: '-210dp', 
				duration: 500,
			});
			menu.isVisible = false;
		}
		if (win.sharing_options)
			win.remove(win.sharing_options);		
	});
	
	row.add(thumbnail);
	row.add(titleLabel);
	return row;
}

var allTitles = [];
var allContent = [];
var allURL = [];
var allDates = [];

var countToday = 0;
var data = [today, old];

function loadWordpress()
{
	var loader;

	function make_data_rows() { // some stub data for the rows.
		var dataTemp = [];
		
		// Create our HTTP Client and name it "loader"
		loader = Titanium.Network.createHTTPClient();
		// Sets the HTTP request method, and the URL to get data from

		loader.open("GET","http://dev.dohanews.co/?json=1&count=20&dev=1");
		// Runs the function when the data is ready for us to process
		
		loader.onload = function() 
		{
			var wordpress = JSON.parse(this.responseText);
			
			for (var i = 0; i < wordpress.posts.length; i++)
			{
				var tweet = wordpress.posts[i].content; // The tweet message
				//var tweet = tweetOriginal.replace( /<[^>]+>/g, '' );
				var articleTitle = wordpress.posts[i].title; // The screen name of the user
				var avatar = wordpress.posts[i].user_avatar; // The profile image
				var url = wordpress.posts[i].url;
				
				var originalDate = wordpress.posts[i].date.split(' ');
				var date = originalDate[0].split('-');
				
				var thumbail;
				
				if (wordpress.posts[i].attachments.length > 0)
					thumbnail = wordpress.posts[i].attachments[0].images.small.url
				else 
					thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";	

				// Create a row and set its height to auto
				
				var articleYear = parseInt(date[0],10);
				var articleMonth = parseInt(date[1],10);
				var articleDay = parseInt(date[2],10);

				var articleToday = articleYear+'-'+articleMonth+'-'+articleDay;
						
				allTitles[i]={title: wordpress.posts[i].title};
				allContent[i]=tweet;
				allURL[i]=url;
				allDates[i]=date;
				
				var articleRow = make_content_view(articleTitle, tweet, thumbnail, url);
				alert(articleDay + ' ' + articleMonth+' '+articleYear);
				if (isToday(articleDay, articleMonth, articleYear)){
					alert('yes!');
					today.add(articleRow);
					countToday++;
				}
				else{
					old.add(articleRow);
				}
				dataTemp.push(articleRow);
			}
		
		if (countToday == 0){
			data = dataTemp;
		}
		
		tbl.setData(data);
		console.log(countToday)
		}
	}

	make_data_rows();
	
	if (Ti.Platform.osname == 'android') {
	
		var scrolled_times = 0;
	
		tbl.addEventListener('scrollEnd', function(e) {
			scrolled_times = 0;
		});
	
	}
	
	tbl.addEventListener('scroll', function(e) {
		if (menu.isVisible == true && (Ti.Platform.osname == 'android' ?  scrolled_times > 3 : true)){
				menu.animate({
					top: '-210dp', 
					duration: 500,
				});
				menu.isVisible = false;
			}	
		scrolled_times++;
	});
	
	tbl.addEventListener('click', function(e) {
		if (menu.isVisible == true){
			menu.animate({
				top: '-210dp', 
				duration: 1000,
			});
			menu.isVisible = false;
		}	
	
	});
	
	tbl.addEventListener ('singletap', function(e){
		var win = Ti.UI.createWindow({
			backgroundColor:'#fff',
			url: 'detail.js',
			modal: true
		})
		win.content = e.source.content;
		win.open({
			animated:true,
		});
	});
	
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
	
	win.add(activityIndicator);
			
	activityIndicator.show();
		
	win.open();
	
	loader.onreadystatechange = function(e){ 
		if (this.readyState == 4) {
			activityIndicator.hide();
			win.add(tbl);
		} 
	};
	loader.send();
}



var lastRow = 0, loadData = true;
setTimeout(function checkSync() {
    // has someone asked us to load data?
    if (loadData == false) {
        // no, return and we'll check again later
        setTimeout(checkSync, 200);
        return;
    }
    Ti.API.warn('LOAD DATA TRIGGERED!');
    // simulate an asynchronous HTTP request loading data after 500 ms
    setTimeout(function() {
        // we got our data; push some new rows
        
        for (var i = lastRow, c = lastRow + 20; i < c; i++) {
        	var articleRow = make_content_view('title'+i, 'tweet'+1, 'http://www.the-brights.net/images/icons/brights_icon_50x50.gif', 'url'+1);
            var day = 8;
            var month = 6;
            var year = 2013;
            
            if (isToday(8,6,2013))
            {
            	
            }            
        }
        lastRow = c;
        // and push this into our table.
        //tbl.setData(data);
        // now we're done; reset the loadData flag and start the interval up again
        loadData = false;
        setTimeout(checkSync, 200);
        Ti.API.warn('DATA LOADED!');
    }, 500);
}, 200);

var isAndroid = Ti.Platform.osname === 'android';

tbl.addEventListener('scroll', function(evt) {
    // If we're on android: our total number of rows is less than the first visible row plus the total number of visible
    // rows plus 3 buffer rows, we need to load more rows!
    // ---OR---
    // If we're on ios: how far we're scrolled down + the size of our visible area + 100 pixels of buffer space
    // is greater than the total height of our table, we need to load more rows!
    if (isAndroid && (evt.totalItemCount < evt.firstVisibleItem + evt.visibleItemCount + 3)
            || (!isAndroid && (evt.contentOffset.y + evt.size.height + 100 > evt.contentSize.height))) {
        // tell our interval (above) to load more rows
        loadData = true;
    }
 
});



win.add(topBar);
win.add(menu);
win.add(menuButton);
topBar.add(photoViewButton);
topBar.add(textViewButton);
topBar.add(searchButton);
topBar.add(topLogo);
loadWordpress();
