// var console = {
  // log: function(str) { return Ti.API.info(str); }
// };
// Create variable "win" to refer to current window
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
loadWordpress();
// 
// var win1 = Titanium.UI.createWindow({
	// backgroundColor:"#fff"
// });
// 
// var myData= ["Row 1 - simple row","Row 2 -  with child","Row 3 -  with detail","Row 4 -  with check","Row 5 -  red background"]
// var newData = []
// 
// for (var i = 0; i < myData.length; i++)
// {
	// myData[i] = {title: myData[i]}
// }
// 
// 
// console.log(myData);
// 
// var table1 =  Titanium.UI.createTableView({
	// data:myData
// });
// 
// 
// win1.add(table1);
// win1.open();