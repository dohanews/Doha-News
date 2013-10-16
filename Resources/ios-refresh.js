var common = require('ios-common');
var pulling = false;
var reloading = false;
var offset = 0;

function getFormattedDate(){
    var date = new Date();
    return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
}
 
var tableHeader = Ti.UI.createView({
    backgroundColor:'white',
    width:320, height:'35dp',
});
 
var border = Ti.UI.createView({
    backgroundColor:'#b2b2b2',
    bottom:0,
    height:2
});
tableHeader.add(border);
 
var imageArrow = Ti.UI.createImageView({
    image:'images/arrow.png',
    left:20,
    bottom:15,
    height:30,
});
tableHeader.add(imageArrow);
 
var labelStatus = Ti.UI.createLabel({
    color:'#70193c',
    font:{fontSize:13, fontWeight:'bold'},
    text:'Pull down to refresh...',
    textAlign:'center',
    left:55, bottom:30,
    width:200
});
tableHeader.add(labelStatus);
 
var labelLastUpdated = Ti.UI.createLabel({
    color:'black',
    font:{fontSize:12},
    text:'Last Updated: ' + getFormattedDate(),
    textAlign:'center',
    left:55, bottom:15,
    width:200
});
tableHeader.add(labelLastUpdated);
 
var actInd = Ti.UI.createActivityIndicator({
    left:20, 
    bottom:15,
    width:30,
    height:30,
    style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
});

tableHeader.add(actInd);

function resetPullHeader(table){
    reloading = false;
    labelLastUpdated.text = 'Last Updated: ' + getFormattedDate();
    actInd.hide();
    imageArrow.transform=Ti.UI.create2DMatrix();
    imageArrow.show();
    labelStatus.text = 'Pull down to refresh...';
    table.setContentInsets({top:0}, {animated:true});
}

var refresh = function(tbl){
	var loader = Titanium.Network.createHTTPClient();

	loader.open("GET","http://dohanews.co/api/adjacent/get_next_posts/?id="+parseInt(recentID,10));
	
	loader.onload = function(){
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length > 0)
			recentID = wordpress.posts[wp_length-1].id;

		for (i = 0; i < wp_length; i++)
		{		
			var articleContent = wordpress.posts[i].content; // The tweet message
			var articleTitle = wordpress.posts[i].title; // The screen name of the user
			var author = wordpress.posts[i].author.name;
			var id = wordpress.posts[i].id;
			var url = wordpress.posts[i].url;
			var date = wordpress.posts[i].date;
			var modified = wordpress.posts[i].modified;
			var thumbail;

			if (wordpress.posts[i].thumbnail_images && wordpress.posts[i].thumbnail_images.thumbnail)
				thumbnail = wordpress.posts[i].thumbnail_images.thumbnail.url;
			else if (wordpress.posts[i].attachments.length > 0 && wordpress.posts[i].attachments[0].images && wordpress.posts[i].attachments[0].images.thumbnail)
				thumbnail = wordpress.posts[i].attachments[0].images.thumbnail.url;
			else
				thumbnail = 'images/default_thumb.png';

			// Create a row and set its height to auto
			var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author, modified, true);
			table_rows[id] = articleRow;
			
			tbl.insertRowBefore(0, articleRow);
		}
		articleData = tbl.data;
		resetPullHeader(tbl);
	};
	
	
	loader.onerror = function(e){
		resetPullHeader(tbl);
	};

	loader.send();
    // and push this into our table.
    // now we're done; reset the loadData flag and start the interval up again
};

var pull_to_refresh = function(e){
    offset = e.contentOffset.y;
    if (pulling && !reloading && offset > -60 && offset < 0){
        pulling = false;
        var unrotate = Ti.UI.create2DMatrix();
        imageArrow.animate({transform:unrotate, duration:180});
        labelStatus.text = 'Pull down to refresh...';
    } else if (!pulling && !reloading && offset < -60){
        pulling = true;
        var rotate = Ti.UI.create2DMatrix().rotate(180);
        imageArrow.animate({transform:rotate, duration:180});
        labelStatus.text = 'Release to refresh...';
    }
};

var update_date_labels = function(tbl){
	for (id in table_rows){
		date = common.get_relative_time(table_rows[id].date);
		table_rows[id].date_label.text = date;
	}
};

var update_content = function(tbl){
	var rows = {};
	for (id in table_rows){
		rows[id] = (table_rows[id].modified);
	}
	
	var json_rows = JSON.stringify(rows);
	
	var loader = Ti.Network.createHTTPClient({Timeout: 10000});
	loader.open('GET','http://dohanews.co/api/refresh/check_date_modified/?outdated_posts=' + json_rows);
	
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
		refresh(tbl);
	};
	
	loader.onerror = function(tbl){
		refresh(tbl);
	};
	
	loader.send();
};

var release_to_refresh = function(e){
    if (pulling && !reloading && offset < -60){
        pulling = false;
        reloading = true;
        labelStatus.text = 'Updating...';
        imageArrow.hide();
        actInd.show();
        e.source.setContentInsets({top:60}, {animated:true});
		update_date_labels(tbl);
        update_content(tbl);
    }
};

var add_pull_to_refresh = function(table){
	table.addEventListener('dragEnd',release_to_refresh);
	table.addEventListener('scroll',pull_to_refresh);
	table.headerPullView = tableHeader;
};

var remove_pull_to_refresh = function(table){
	table.removeEventListener('dragEnd',release_to_refresh);
	table.removeEventListener('scroll',pull_to_refresh);
	table.headerPullView = null;
};


