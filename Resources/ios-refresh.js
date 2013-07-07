var common = require('ios-common');
var pulling = false;
var reloading = false;
var offset = 0;

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
 
var imageArrow = Ti.UI.createImageView({
    image:'https://github.com/appcelerator/titanium_mobile/raw/master/demos/KitchenSink/Resources/images/whiteArrow.png',
    left:20, bottom:10,
    width:23, height:60
});
tableHeader.add(imageArrow);
 
var labelStatus = Ti.UI.createLabel({
    color:'#576c89',
    font:{fontSize:13, fontWeight:'bold'},
    text:'Pull down to refresh...',
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

	loader.open("GET","http://dev.dohanews.co/api/adjacent/get_next_posts/?dev=1&id="+parseInt(recentID,10));
	
	loader.onload = function() 
	{
		var wordpress = JSON.parse(this.responseText);
		
		var wp_length = wordpress.posts.length;

		if (wp_length > 0)
			recentID = wordpress.posts[wp_length-1].id;

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
				thumbnail = "http://www.the-brights.net/images/icons/brights_icon_50x50.gif";

			// Create a row and set its height to auto
			var articleRow = common.make_content_view(articleTitle, articleContent, thumbnail, url, id, date, author);
			tbl.insertRowBefore(0, articleRow);
		}
		
		articleData = tbl.data;
		resetPullHeader(tbl);
	}
	
	loader.send();
    // and push this into our table.
    // now we're done; reset the loadData flag and start the interval up again
};

var pull_to_refresh = function(e){
    offset = e.contentOffset.y;
    if (pulling && !reloading && offset > -80 && offset < 0){
        pulling = false;
        var unrotate = Ti.UI.create2DMatrix();
        imageArrow.animate({transform:unrotate, duration:180});
        labelStatus.text = 'Pull down to refresh...';
    } else if (!pulling && !reloading && offset < -80){
        pulling = true;
        var rotate = Ti.UI.create2DMatrix().rotate(180);
        imageArrow.animate({transform:rotate, duration:180});
        labelStatus.text = 'Release to refresh...';
    }
};

var release_to_refresh = function(e){
    if (pulling && !reloading && offset < -80){
        pulling = false;
        reloading = true;
        labelStatus.text = 'Updating...';
        imageArrow.hide();
        actInd.show();
        e.source.setContentInsets({top:80}, {animated:true});
        refresh(tbl);
    }
}

var add_pull_to_refresh = function(table){
	table.addEventListener('dragEnd',release_to_refresh);
	table.addEventListener('scroll',pull_to_refresh);
	table.headerPullView = tableHeader;
}

var remove_pull_to_refresh = function(table){
	table.removeEventListener('dragEnd',release_to_refresh);
	table.removeEventListener('scroll',pull_to_refresh);
	table.headerPullView = null;
}


