// var console = {
  // log: function(str) { return Ti.API.info(str); }
// };
// Create variable "win" to refer to current window

var win = Titanium.UI.currentWindow;

var tbl = Ti.UI.createTableView({
	backgroundColor:'#fff',
	minRowHeight: 70,
	selectionStyle: 'none'
});

var current_row; // this will hold the current row we swiped over, so we can reset it's state when we do any other gesture (scroll the table, swipe another row, click on another row)

var make_actions_view = function(where) { // create the actions view - the one will be revealed on swipe

	var view = Ti.UI.createView({
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	for (var i = 0; i < 6; i++) {
		view.add(Ti.UI.createImageView({
			width: '50dp',
			left: (10 + (50 * i))+'dp',
			height: '50dp',
			image: 'KS_nav_ui.png',
			is_action: 'action ' + i
		}));
	};

	return view;
};

var make_content_view = function(content) {// create the content view - the one is displayed by default

	var view = Ti.UI.createView({
		backgroundColor: '#fff',
		height: Ti.UI.SIZE
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
		loader.open("GET","http://preview.blogdroid.com/dohanews.co/api/get_recent_posts/?dev=1");
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
				// Create a row and set its height to auto
						
				allTitles[i]={title: wordpress.posts[i].title};
				allContent[i]=tweet;
				
				var row = Ti.UI.createTableViewRow({
					height: Ti.UI.SIZE,
					backgroundColor:'#fff',
					font: {
			            fontSize: 10,
			            fontWeight: 'bold',
			            fontFamily: 'Arial'
			        },
				});
								
				var v1 = make_actions_view();
				row.v2 = make_content_view(articleTitle);
				row.add(v1);
				row.add(row.v2);
				row.className = "item"+i;
			
				var swipeAnimation = Ti.UI.createAnimation({
					left: Titanium.Platform.displayCaps.platformWidth * -1,
					duration: 500
				});
				
				swipeAnimation.addEventListener('complete', function(){
					current_row.v2.animate({
						opacity:0,
						duration:0
					})
				});
				
				// android behaves in a different way so we need to add the event to the row.
				row.addEventListener('swipe', function(e) {
					if (!!current_row) {
						current_row.v2.animate({
							left: 0,
							opacity: 1,
							duration: 0
						});
					}
	
					current_row = Ti.Platform.osname == 'android' ? this : e.row; // it looks like android does not have the e.row property for this event.

					current_row.v2.animate(swipeAnimation);
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
				opacity: 1,
				left: 0,
				duration: 0
			});
			current_row = null;
		}
	
		scrolled_times++;
	});
	
	tbl.addEventListener('click', function(e) {
		if (e.source.is_action) {
			alert(e.source.is_action);
		} else {
			//alert('row clicked');
			if (current_row) {
				current_row.v2.animate({
					opacity: 1,
					left: 0,
					duration: 0
				});
				current_row = null;
			}
	
		}
		var win = Ti.UI.createWindow({
    			backgroundColor:'#fff',
    			url: 'detail.js'
    		})
    		win.content = allContent[e.index];
    	Ti.UI.currentTab.open(win,{animation:true});
		
	});
	
	win.add(tbl);
	win.open();
	loader.send();
}

loadWordpress();
	


///////////////////////////////////////////////////////////

/*

var win = Titanium.UI.currentWindow;

// Function loadTweets()
function loadWordpress()
{
	// Empty array "rowData" for our tableview
	var rowData = [];
	var allTitles = [];
	var allContent = [];
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient();
	// Sets the HTTP request method, and the URL to get data from
	loader.open("GET","http://preview.blogdroid.com/dohanews.co/api/get_recent_posts/?dev=1");
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
			// Create a row and set its height to auto
			var row = Titanium.UI.createTableViewRow({
    			backgroundColor: '#eee',
		        color: 'black',
		        font: {
		            fontSize: 10,
		            fontWeight: 'bold',
		            fontFamily: 'Arial'
		        },
		        height: Ti.UI.SIZE,
		        layout: 'horizontal',
		        width: Ti.UI.FILL
			});
			
			allTitles[i]={title: wordpress.posts[i].title};
			allContent[i]=tweet;
			
			// Create the view that will contain the text and avatar
			var post_view = Titanium.UI.createView({
				height:'auto', 
				layout:'vertical',
				top:5,
				right:5,
				bottom:5,
				left:5
			});
			// Create image view to hold profile pic
			var av_image = Titanium.UI.createImageView({
				url:avatar, // the image for the image view
				top:0,
				left:0,
				height:48,
				width:48
			});
			post_view.add(av_image);
			// Create the label to hold the screen name
			var user_lbl = Titanium.UI.createLabel({
				text:articleTitle,
				left:5,
				top:-50,
				width: 'auto',
				textAlign:'left',
				font:{fontSize:12}
			});
			post_view.add(user_lbl);

			// Add the post view to the row
			row.add(post_view);
			// Give each row a class name
			row.className = "item"+i;
			// Add row to the rowData array
			rowData[i] = row;
		}
		// Create the table view and set its data source to "rowData" array
		var tableView = Titanium.UI.createTableView({data:allTitles});
		
		tableView.addEventListener('click', function(e) {
    		var win = Ti.UI.createWindow({
    			backgroundColor:'#fff',
    			url: 'detail.js'
    		})
    		win.content = allContent[e.index];
    	Ti.UI.currentTab.open(win,{animation:true});
    	});
		//Add the table view to the window
		win.add(tableView);
	};
	// Send the HTTP request
	loader.send();
}
loadWordpress();*/

