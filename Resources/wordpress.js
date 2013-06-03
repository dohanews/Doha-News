var rotate90 = Ti.UI.create2DMatrix({ rotate: 90 });
var osname = Ti.Platform.osname;

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';
win.navBarHidden = true;


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

var current_row; // this will hold the current row we swiped over, so we can reset it's state when we do any other gesture (scroll the table, swipe another row, click on another row)


var today = Titanium.UI.createTableViewSection({
    headerTitle:"Today"
});
var old = Titanium.UI.createTableViewSection({
    headerTitle:"Older"
});


// create the actions view - the one will be revealed on swipe
var create_sharing_options_view = function(where) { 

	var view = Ti.UI.createView({
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	var icons =['images/facebook.png', 'images/twitter.png', 'images/mail.png'];
	for (var i = 0; i < 3; i++) {
		view.add(Ti.UI.createImageView({
			width: '50dp',
			left: (10 + (80 * (i)))+'dp',
			height: '50dp',
			image: icons[i],
			is_action: i+1
		}));
	};

	return view;
}

var make_content_view = function(title, content, thumbnail) {// create the content view - the one is displayed by default

	var view = Ti.UI.createView({
		backgroundColor: '#fdfcf8',
		height: '95dp',
		width: Titanium.Platform.displayCaps.platformWidth,
	}); 

	var thumbnail = Ti.UI.createImageView({
		height: '80dp',
		width: '80dp',
		left: '7.5dp',
		borderColor: '#E3E3E3',
		borderWidth: '1dp',
		image: thumbnail
	});

	var fontSize;
	if (osname == 'android')
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;
	else
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/30;
		
	var title = Ti.UI.createLabel({
		text: title,
		color:'#4A4A4A',
		top: '10dp',
		left: '100dp',
		right: '20dp',
		width: '200dp',
		height: Ti.UI.SIZE,
		font: {
			fontSize: fontSize,
		},
		backgroundColor:'transparent'
	});
	
	var time = Ti.UI.createLabel({
		text: '30-MAY 05:30PM',
		color:'#D6D6D6',
		backgroundColor: 'white',
		borderColor: '#E3E3E3',
		borderWidth: 1,
		left: '305dp',
		height: '75dp',
		width: '65dp',
		transform: rotate90,
		font: {
			fontSize: fontSize,
			fontWeight: 'bold',
		},
		zIndex:11
	});

	view.add(thumbnail);
	view.add(title);
	view.add(time);
	view.addEventListener ('click', function(e){
					var win = Ti.UI.createWindow({
		    			backgroundColor:'#fff',
		    			url: 'detail.js',
		    			modal: true
		    		})
		    		win.content = content;
		    		win.open({
		    			animated:true,
		    		});
    			});
	return view;

}

var allTitles = [];
var allContent = [];
var allURL = [];
var allDates = [];

var countToday = 0;

function loadWordpress()
{
	var loader;
	function make_data_rows() { // some stub data for the rows.
		var data = [today, old];
		var dataTemp = [];
		
		// Create our HTTP Client and name it "loader"
		loader = Titanium.Network.createHTTPClient();
		// Sets the HTTP request method, and the URL to get data from

		loader.open("GET","http://dev.dohanews.co/?json=1&count=10&dev=1");
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
				
				var articleYear = parseInt(date[0]);
				var articleMonth = parseInt(date[1]);
				var articleDay = parseInt(date[2]);
				
				
				
				//var dates = "Today: "+currentMonth+"/"+currentDay+"/"+currentYear+" Article: "+articleMonth+"/"+articleDay+"/"+articleYear
				
				//var today = currentYear+'-'+currentMonth+'-'+currentDay
				var articleToday = articleYear+'-'+articleMonth+'-'+articleDay
				
				
				//console.log(isToday(articleDay, articleMonth, articleYear))
						
				allTitles[i]={title: wordpress.posts[i].title};
				allContent[i]=tweet;
				allURL[i]=url;
				allDates[i]=date;
				
				var row = Ti.UI.createTableViewRow({
					height: Ti.UI.SIZE,
					backgroundColor:'#fff',
					selectedBackgroundColor: 'white',
					font: {
			            fontSize: '30px',
			            fontWeight: 'bold',
			        },
				});
								
				var sharing_options = create_sharing_options_view();
				row.v2 = make_content_view(articleTitle, tweet, thumbnail);
				
				
    			
				row.add(sharing_options);
				row.add(row.v2);
				row.className = "item"+i;
				
				// android behaves in a different way so we need to add the event to the row.
				row.addEventListener('swipe', function(e) {
					if (menu.isVisible == true){
						menu.animate({
							top: '-210dp', 
							duration: 500,
						});
						menu.isVisible = false;
					}	
					if (e.direction == 'left') {
						if (!!current_row) {
							current_row.v2.animate({
								left: '-5dp',
								duration: 0
							});
						}
		
						current_row = osname == 'android' ? this : e.row; // it looks like android does not have the e.row property for this event.
	
						current_row.v2.animate({
							left: Titanium.Platform.displayCaps.platformWidth * -1,
							duration: 500});
					}
					else if (e.direction == 'right') {
						alert('swiped right');
						if (!!current_row) {
							current_row.v2.animate({
								left: '-5dp',
								duration: 0
							});
						}
						
						current_row = null;
					}
					
				});
	
				if (isToday(articleDay, articleMonth, articleYear)){
					today.add(row);
					countToday++;
				}
				else{
					old.add(row);
				}
				dataTemp.push(row);
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
	
		if (!!current_row && (Ti.Platform.osname == 'android' ?  scrolled_times > 3 : true)) {
			current_row.v2.animate({
				left: '-5dp',
				duration: 0
			});
			current_row = null;
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
		if (e.source.is_action) {
			if (e.source.is_action == 1) {alert('post to facebook'), console.log('facebook icon clicked')}
			else if (e.source.is_action == 2) {alert('tweet article'), console.log('twitter icon clicked')}
			else if (e.source.is_action == 3) {
				var emailDialog = Ti.UI.createEmailDialog()
				emailDialog.subject = allTitles[e.index].title;
				emailDialog.messageBody = allURL[e.index];
				emailDialog.open();
				console.log(allTitles[e.index].title)
			}
		} else {
			if (current_row) {
				
				current_row.v2.animate({
					left: '-5dp',
					duration: 0
				});
				current_row = null;
			}
		}
		
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

menuButton.addEventListener('click',function(){
	if (current_row) {
		current_row.v2.animate({
			left: '-5dp',
			duration: 0
		});
		current_row = null;
	}
})

win.add(topBar);
win.add(menu);
win.add(menuButton);
topBar.add(photoViewButton);
topBar.add(textViewButton);
topBar.add(searchButton);
topBar.add(topLogo);
loadWordpress();
