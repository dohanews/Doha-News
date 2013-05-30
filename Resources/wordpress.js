var osname = Ti.Platform.osname;

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';


var topBar = Titanium.UI.createView({
	backgroundColor: '#70193c',
	height: '0.75cm',
	top: 0
});

win.add(topBar);

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
	backgroundColor:'#fff',
	minRowHeight: '110dp',
	top: '.75cm',
	selectionStyle: 'none',
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

	var icons =['KS_nav_ui.png','images/facebook.png', 'images/twitter.png', 'images/mail.png']
	for (var i = 1; i < 4; i++) {
		view.add(Ti.UI.createImageView({
			width: '40dp',
			left: (10 + (80 * (i-1)))+'dp',
			height: '40dp',
			image: icons[i],
			is_action: i
		}));
	};

	return view;
};

var make_content_view = function(content, thumbnail) {// create the content view - the one is displayed by default

	var view = Ti.UI.createView({
		backgroundColor: '#fff',
		height: Ti.UI.SIZE,
		width: Titanium.Platform.displayCaps.platformWidth	
	});

	var img = Ti.UI.createImageView({
		height: '80dp',
		width: '80dp',
		left: '15dp',
		borderColor: '#E3E3E3',
		borderWidth: '1dp',
		image: thumbnail
	});

	var fontSize;
	if (osname == 'android')
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/40;
	else
		fontSize = (Titanium.Platform.displayCaps.platformHeight)/30;
		
	var label = Ti.UI.createLabel({
		text: content,
		color:'#4A4A4A',
		top: 0,
		left: '110dp',
		right: '20dp',
		height: Ti.UI.SIZE,
		font: {
			fontSize: fontSize,
		},
	});

	view.add(img);
	view.add(label);

	return view;

};

var allTitles = [];
var allContent = [];
var allURL = [];
var allDates = [];

function loadWordpress()
{
	var loader;
	function make_data_rows() { // some stub data for the rows.
		var data = [today, old];
		
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
					font: {
			            fontSize: '30px',
			            fontWeight: 'bold',
			        },
				});
								
				var sharing_options = create_sharing_options_view();
				row.v2 = make_content_view(articleTitle, thumbnail);
				row.add(sharing_options);
				row.add(row.v2);
				row.className = "item"+i;
				
				// android behaves in a different way so we need to add the event to the row.
				row.addEventListener('swipe', function(e) {
					if (e.direction == 'left') {
						if (!!current_row) {
							current_row.v2.animate({
								left: 0,
								duration: 0
							});
						}
		
						current_row = osname == 'android' ? this : e.row; // it looks like android does not have the e.row property for this event.
	
						current_row.v2.animate({
							left: Titanium.Platform.displayCaps.platformWidth * -1,
							duration: 250});
					}
					else if (e.direction == 'right') {
						alert('swiped right');
					}
					
				});
	
				if (isToday(articleDay, articleMonth, articleYear)){
					today.add(row);
				}
				else{
					old.add(row);
				}

			}
			
		tbl.setData(data);

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
	
		if (!!current_row && (Ti.Platform.osname == 'android' ?  scrolled_times > 3 : true)) {
			current_row.v2.animate({
				left: 0,
				duration: 0
			});
			current_row = null;
		}
	
		scrolled_times++;
	});
	
	tbl.addEventListener('click', function(e) {
		if (e.source.is_action) {
			if (e.source.is_action == 1) {alert('post to facebook'), console.log('facebook icon clicked')}
			if (e.source.is_action == 2) {alert('tweet article'), console.log('twitter icon clicked')}
			if (e.source.is_action == 3) {
				var emailDialog = Ti.UI.createEmailDialog()
				emailDialog.subject = allTitles[e.index].title;
				emailDialog.messageBody = allURL[e.index];
				emailDialog.open();
				console.log(allTitles[e.index].title)
			}
		} else {
			if (current_row) {
				
				current_row.v2.animate({
					left: 0,
					duration: 0
				});
				current_row = null;
			}
			
			var win = Ti.UI.createWindow({
    			backgroundColor:'#fff',
    			url: 'detail.js',
    			modal: true
    			
    		})
    		win.content = allContent[e.index];
    		win.open({animated:true});
			
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

loadWordpress();
