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

	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://dndev.staging.wpengine.com/api/adjacent/get_next_posts/?id="+parseInt(recentID,10));
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length > 0){
			recentID = wordpress.posts[wp_length-1].id;
		}
		else{
			actInd.hide();
			labelStatus.text = 'That\'s all, folks!';
			setTimeout(function(){
				tbl.deleteRow(tableHeaderRow);
			}, 2000);
		}
		alert(wp_length);
		for (i = 0; i < wp_length; i++)
		{
			tbl.deleteRow(tableHeaderRow);
			
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
			var modified = wordpress.posts[i].modified;
			var thumbail;

			if (wordpress.posts[i].attachments.length > 0)
				thumbnail = wordpress.posts[i].attachments[0].images.small.url
			else 
				thumbnail = 'images/default_thumb.png';
			
			// Create a row and set its height to auto
			alert(date);
			var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified);
			table_rows[id] = articleRow;
			
			tbl.insertRowBefore(0, articleRow);
		}
		
		articleData = tbl.data;
		update_content();
	}
	
	loader.onerror = function(e){
		tbl.deleteRow(tableHeaderRow);
	}
	
	loader.send();
};

var change_date_labels = function(){
	for (id in table_rows){
		date = get_relative_time(table_rows[id].date);
		table_rows[id].date_label.text = date;
	}
};

var update_content = function(){
	var rows = {};
	for (id in table_rows){
		rows[id] = (table_rows[id].modified);
	}
	
	var json_rows = JSON.stringify(rows);
	
	var loader = Ti.Network.createHTTPClient({Timeout: 10000});
	loader.open('GET','http://dndev.staging.wpengine.com/api/refresh/check_date_modified/?outdated_posts=' + json_rows);
	
	loader.onload = function(){
		var modified_posts = JSON.parse(this.responseText);
		alert(modified_posts.posts.length);
		for (i = 0; i < modified_posts.posts.length; i++){
			var id = modified_posts.posts[i].id;
			
			table_rows[id].title_label.text = modified_posts.posts[i].title;
			table_rows[id].url = modified_posts.posts[i].url;
			table_rows[id].content = modified_posts.posts[i].content;
			table_rows[id].articleTitle = modified_posts.posts[i].title;
			table_rows[id].id = modified_posts.posts[i].id;
			table_rows[id].date = modified_posts.posts[i].date;
			table_rows[id].modified = modified_posts.posts[i].modified;
		}	
		refreshing = false;
	}
	
	loader.onerror = function(){
		refreshing = false;
	}
	
	loader.send();
}