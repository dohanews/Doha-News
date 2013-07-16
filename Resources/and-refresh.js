Ti.include('and-common.js');

var refreshing = false;

function getFormattedDate(){
    var date = new Date();
    return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
}
 
var tableHeader = Ti.UI.createView({
    backgroundColor:'#e2e7ed',
    width:320, height:60
});
 
var border = Ti.UI.createView({
    backgroundColor:'#576c89',
    bottom:0,
    height:2
});

tableHeader.add(border);

var labelStatus = Ti.UI.createLabel({
    color:'#576c89',
    font:{fontSize:13, fontWeight:'bold'},
    text:'Updating...',
    textAlign:'center',
    left:55, bottom:30,
    width:200
});
tableHeader.add(labelStatus);
 
var labelLastUpdated = Ti.UI.createLabel({
    color:'#576c89',
    font:{fontSize:12},
    text:'Last Updated: ' + getFormattedDate(),
    textAlign:'center',
    left:55, bottom:15,
    width:200
});
tableHeader.add(labelLastUpdated);
 
var actInd = Ti.UI.createActivityIndicator({
    left:20, bottom:13,
    width:30, height:30
});

tableHeader.add(actInd);
var tableHeaderRow = Ti.UI.createTableViewRow({
	height: Ti.UI.SIZE,
});
tableHeaderRow.add(tableHeader);

var refresh = function(e){
	
	if (refreshing){
		return;
	}
	
	labelStatus.text = 'Updating...';
	tbl.insertRowBefore(0,tableHeaderRow);
	actInd.show();
	
	refreshing = true;
	
	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://dev.dohanews.co/api/adjacent/get_next_posts/?dev=1&id="+parseInt(recentID,10));
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length > 0){
			recentID = wordpress.posts[wp_length-1].id;
			tbl.deleteRow(tableHeaderRow);
		}
		else{
			actInd.hide();
			labelStatus.text = 'That\'s all, folks!';
			setTimeout(function(){
				tbl.deleteRow(tableHeaderRow);
				refreshing = false;
			}, 2000);
		}

		for (i = 0; i < wp_length; i++)
		{
			if (firstAd == 0) {
				var adMobRow = createAdMobView();
				tbl.insertRowBefore(0, adMobRow);
				firstAd = 10;
			}
		
			firstAd--;
			var articleContent = wordpress.posts[i].content; // The tweet message
			var articleTitle = wordpress.posts[i].title; // The screen name of the user
			var author = wordpress.posts[i].author.name;
			var id = wordpress.posts[i].id;
			var url = wordpress.posts[i].url;
			var date = wordpress.posts[i].date;
			
			var thumbail;

			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = 'images/default_thumb.png';

			// Create a row and set its height to auto
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
			tbl.insertRowBefore(0, articleRow);
		}
		
		articleData = tbl.data;
	}
	
	loader.onerror = function(e){
		tbl.deleteRow(tableHeaderRow);
	}
	
	loader.send();
	
    // and push this into our table.
    // now we're done; reset the loadData flag and start the interval up again
};

var change_date_labels = function(tbl){

	for (i = 0; i < tbl.data[0].rows.length; i++){
		if(tbl.data[0].rows[i].className == 'article'){
			console.log((tbl.data[0].rows[i].date));
			date = get_relative_time(tbl.data[0].rows[i].date);
			tbl.data[0].rows[i].date_label.text = date;
		}
	}
};

var refreshButton = Ti.UI.createButton({
	title: 'R',
	width: '40dp',
	height: '40dp',
});

refreshButton.addEventListener('click', function(){
	refresh();
	change_date_labels()
});

header.add(refreshButton);