// var console = {
  // log: function(str) { return Ti.API.info(str); }
// };
// Create variable "win" to refer to current window

var osname = Ti.Platform.osname;

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';

function customHeader() {
	var view = Ti.UI.createView({
		height: (Ti.Platform.displayCaps.platformHeight)/10
	});
	
	var img = Ti.UI.createImageView({
		image: 'images/doha-news.png'
	});
			
	view.add(img);
	return view;
};

var tbl = Ti.UI.createTableView({
	backgroundColor:'#fff',
	minRowHeight: 70,
	headerView:customHeader(),
	selectionStyle: 'none'
});

var current_row; // this will hold the current row we swiped over, so we can reset it's state when we do any other gesture (scroll the table, swipe another row, click on another row)

// create the actions view - the one will be revealed on swipe
var create_sharing_options_view = function(where) { 

	var view = Ti.UI.createView({
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	var icons =['images/facebook.png', 'images/twitter.png', 'images/mail.png']
	for (var i = 0; i < 3; i++) {
		view.add(Ti.UI.createImageView({
			width: '40dp',
			left: (10 + (80 * i))+'dp',
			height: '40dp',
			image: icons[i],
			is_action: 'action ' + i
		}));
	};

	return view;
};

var make_content_view = function(content) {// create the content view - the one is displayed by default

	var view = Ti.UI.createView({
		backgroundColor: '#fff',
		height: Ti.UI.SIZE,
		width: Titanium.Platform.displayCaps.platformWidth	
	});

	var img = Ti.UI.createImageView({
		height: '40dp',
		width: '40dp',
		left: '5dp',
		top: '5dp',
		image: 'https://si0.twimg.com/profile_images/2179402304/appc-fb_normal.png'
	});

	var label = Ti.UI.createLabel({
		text: content,
		color:'#000',
		top: 0,
		left: '50dp',
		right: '5dp',
		height: Ti.UI.SIZE
	});

	view.add(img);
	view.add(label);

	return view;

};

var allTitles = [];
var allContent = [];
var allURL = [];

function loadWordpress()
{
	var loader;
	function make_data_rows() { // some stub data for the rows.
		var data = [];
		
		// Empty array "rowData" for our tableview
		var rowData = [];
		
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
				// Create a row and set its height to auto
						
				allTitles[i]={title: wordpress.posts[i].title};
				allContent[i]=tweet;
				allURL[i]=url;
				
				var row = Ti.UI.createTableViewRow({
					height: Ti.UI.SIZE,
					backgroundColor:'#fff',
					font: {
			            fontSize: 10,
			            fontWeight: 'bold',
			            fontFamily: 'Arial'
			        },
				});
								
				var sharing_options = create_sharing_options_view();
				row.v2 = make_content_view(articleTitle);
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
		
						current_row = Ti.Platform.osname == 'android' ? this : e.row; // it looks like android does not have the e.row property for this event.
	
						current_row.v2.animate({
							left: Titanium.Platform.displayCaps.platformWidth * -1,
							duration: 250});
					}
					else if (e.direction == 'right') {
						alert('swiped right');
					}
					
				});
	
				data.push(row);
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
			if (e.source.is_action==='action 0') {alert('post to facebook'), console.log('facebook icon clicked')}
			if (e.source.is_action==='action 1') {alert('tweet article'), console.log('twitter icon clicked')}
			if (e.source.is_action==='action 2') {
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
