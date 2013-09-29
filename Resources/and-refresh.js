Ti.include('and-common.js');

var refreshing = false;
var loadingRow;

function getFormattedDate(){
    var date = new Date();
    return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
}
 
// var tableHeaderRow = Ti.UI.createTableViewRow({
	// height: '70dp',
	// width: Ti.UI.FILL,
	// backgroundColor:'#e2e7ed',
// });
// 
// var border = Ti.UI.createView({
    // backgroundColor:'#576c89',
    // bottom:0,
    // height:'2dp',
// });
// 
// tableHeaderRow.add(border);
// 
// var labelStatus = Ti.UI.createLabel({
    // color:'#576c89',
    // font:{fontSize:'13dp', fontWeight:'bold'},
    // text:'Updating...',
    // textAlign:'center',
    // left:'55dp', 
    // bottom:'30dp',
    // width:'200dp'
// });
// tableHeaderRow.add(labelStatus);
//  
// var labelLastUpdated = Ti.UI.createLabel({
    // color:'#576c89',
    // font:{fontSize:'12dp'},
    // text:'Last Updated: ' + getFormattedDate(),
    // textAlign:'center',
    // left:'55dp', bottom:'15dp',
    // width:'200dp'
// });
// tableHeaderRow.add(labelLastUpdated);
//  
// var actInd = Ti.UI.createActivityIndicator({
    // left:'20dp',
	// height:Ti.UI.SIZE,
	// width:Ti.UI.SIZE,
   	// style: Ti.UI.ActivityIndicatorStyle.DARK,
// });
// 
// tableHeaderRow.add(actInd);

var create_activity = function(){
	
	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.ActivityIndicatorStyle.BIG_DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	return activityIndicator;
};

var fade = function(opacity, callback){

	var animation = Ti.UI.createAnimation({
			opacity: opacity,
			duration: 200,
	});

	animation.addEventListener('complete', callback);
	return animation;
};
		
var create_loading_background = function(){
		
	var loadingView = Ti.UI.createView({
		height: '100dp',
		backgroundColor: 'black',
		opacity: 0.7,
		top: 0,
	});
	
	var loadingIndicator = create_activity();
	loadingView.add(loadingIndicator);
	loadingIndicator.show();
	return loadingView; 
};

var refresh = function(e){
	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://s6062.p9.sites.pressdns.com/api/adjacent/get_next_posts/?id="+parseInt(recentID,10));
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length <= 0){
			// actInd.hide();
			// labelStatus.text = 'That\'s all, folks!';
			// setTimeout(function(){
				// tbl.deleteRow(tableHeaderRow);
			// }, 2000);
			loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
		}
		else{
			recentID = wordpress.posts[wp_length-1].id;
		
			for (i = 0; i < wp_length; i++)
			{
				//tbl.deleteRow(tableHeaderRow);
				
				if (firstAd == 0) {
					//var adMobRow = createAdMobView();
					//tbl.insertRowBefore(0, adMobRow);
					//firstAd = 10;
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
					thumbnail = wordpress.posts[i].attachments[0].images.thumbnail.url;
				else 
					thumbnail = 'images/default_thumb.png';
	
			
				var articleRow = make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified, true);
				table_rows[id] = articleRow;
				
				tbl.insertRowBefore(0, articleRow);
			}
			articleData = tbl.data;
			loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
			//tbl.deleteRow(tableHeaderRow);
		}
		refreshing = false;
	};
	
	loader.onerror = function(e){
		loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
		//tbl.deleteRow(tableHeaderRow);
		refreshing = false;
	};
	
	loader.send();
};

var update_date_labels = function(){
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
	loader.open('GET','http://s6062.p9.sites.pressdns.com/api/refresh/check_date_modified/?outdated_posts=' + json_rows);
	
	loader.onload = function(){
		var modified_posts = JSON.parse(this.responseText);
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
		refresh();
	};
	
	loader.onerror = function(){
		refresh();
	};
	
	loader.send();
};

Ti.App.refreshArticles = function(){
	if (!refreshing && content_loaded){
		refreshing = true;
		//labelStatus.text = 'Updating...';
		loadingRow = create_loading_background();
		win.add(loadingRow);
		//actInd.show();
		update_date_labels();
		update_content();
	}
};
