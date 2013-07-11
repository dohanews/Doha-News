var current_row = null;

var create_facebook_share = function(title, url){
	var facebook_icon = Ti.UI.createImageView({
		width: '50dp',
		center: {x: 0.2 * Ti.Platform.displayCaps.platformWidth},
		height: '50dp',
		image: 'images/facebook.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	
	return facebook_icon;
};

var create_twitter_share = function(title, url){
	
	var twitter_icon = Ti.UI.createImageView({
		width: '50dp',
		center: {x: 0.4 * Ti.Platform.displayCaps.platformWidth},
		height: '50dp',
		image: 'images/twitter.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	
	return twitter_icon;
};

var create_email_share = function(title, url){
	
	var email_icon = Ti.UI.createImageView({
		width: '50dp',
		center: {x: 0.6 * Ti.Platform.displayCaps.platformWidth},
		height: '50dp',
		image: 'images/mail.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});

	email_icon.addEventListener('click', function(){
		var activity = Ti.Android.currentActivity;
		var intent = Ti.Android.createIntent({
		            action: Ti.Android.ACTION_SEND,
		            type: 'text/plain'
		        });
		
		intent.putExtra(Ti.Android.EXTRA_TEXT, url);
		intent.putExtra(Ti.Android.EXTRA_SUBJECT, title);
		activity.startActivity(Ti.Android.createIntentChooser(intent,'Share'));	
	});

	return email_icon;
};

var create_bookmarks = function(title, url, author, content, date, id){
	
	var image;
	if (db.exists(id)){
		image = 'images/Bookmarks-06.png';
	}
	else{
		image = 'images/Bookmarks-00.png';
	}
	
	var bookmark = Ti.UI.createImageView({
		width: '50dp',
		center: {x: 0.8 * Ti.Platform.displayCaps.platformWidth},
		height: '50dp',
		image: image,
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	bookmark.addEventListener('postlayout', function(){
		if (db.exists(id)){
			bookmark.image = 'images/Bookmarks-06.png';
		}
		else{
			bookmark.image = 'images/Bookmarks-00.png';
		}
	});
	
	bookmark.addEventListener('click',function(e){
		if (db.exists(id)){
			if (Ti.UI.currentWindow.id == 'bookmarks'){
				
				current_row.articleRow.animate({
					opacity: 1,
					duration: 500
				});
				
				tbl.deleteRow(current_row);
				current_row = null;
			}
			
			bookmark.animate({opacity:0, duration: 0}, function(){;
				bookmark.image = 'images/Bookmarks-00.png'
				bookmark.animate({opacity:1, duration: 350});
			});
			db.deleteId(id);
		}
		else{
			bookmark.animate({opacity:0, duration: 0}, function(){;
				bookmark.image = 'images/Bookmarks-06.png'
				bookmark.animate({opacity:1, duration: 350});
			});
			db.insert(id, title, content, url, author, date);
		}
	});
	
	
	return bookmark;
};


var create_sharing_options_view = function(url, title, content, thumbnail, id, date, author) { 

	var icons = Ti.UI.createView({
		backgroundColor: 'white',
		bubbleParent: false,
		height: '90dp',
		borderColor: 'transparent',
		borderWidth: 0,
	});

	icons.add(create_facebook_share(title,url));
	icons.add(create_twitter_share(title,url));
	icons.add(create_email_share(title,url));
	icons.bookmark = create_bookmarks(title, url, author, content, date, id);
	icons.add(icons.bookmark);
	return icons;
};

var sharing_animation = function(e) {
	if (!!current_row) {
		current_row.articleRow.animate({
			opacity: 1,
			duration: 500
		});
	};
	
	current_row = this;
	if (db.exists(current_row.id)){
		current_row.sharing.bookmark.image = 'images/Bookmarks-06.png';
	}
	else{
		current_row.sharing.bookmark.image = 'images/Bookmarks-00.png';	
	}
	current_row.sharing.bookmark.image;
	current_row.articleRow.animate({
		opacity: 0,
		duration: 500
	});
};

