var current_row = null;

var create_facebook_share = function(title, url){
	var facebook_icon = Ti.UI.createImageView({
		width: '50dp',
		left: '10dp',
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
		left: '90dp',
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
		left: '170dp',
		height: '50dp',
		image: 'images/mail.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	email_icon.addEventListener('click',function(e){	
		var emailDialog = Ti.UI.createEmailDialog({
			subject: title,
			messageBody: url,
		});
		emailDialog.open();
	});
	
	return email_icon;
};

var create_bookmarks = function(title, url, author, content, date, id){
	
	var bookmark = Ti.UI.createImageView({
		width: '50dp',
		left: '250dp',
		height: '50dp',
		image: 'KS_nav_ui.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});

	bookmark.addEventListener('click',function(e){
		if (db.exists(id)){
			if (Ti.UI.currentWindow.id == 'bookmarks'){
				console.log('deleterow');
				
				current_row.articleRow.animate({
					opacity: 1,
					duration: 500
				});
					
				tbl.deleteRow(current_row);
				current_row = null;
			}
			db.deleteId(id);
		}
		else
			db.insert(id, title, content, url, author, date);
	});
	
	
	return bookmark;
};


var create_sharing_options_view = function(url, title, content, thumbnail, id, date, author) { 

	var icons = Ti.UI.createView({
		backgroundColor: 'white',
		bubbleParent: false,
		hieght: Ti.UI.SIZE,
	});
	
	icons.add(create_facebook_share(title,url));
	icons.add(create_twitter_share(title,url));
	icons.add(create_email_share(title,url));
	icons.add(create_bookmarks(title, url, author, content, date, id));

	return icons;
};

var sharing_animation;


sharing_animation = function(e) {
	if (!!current_row) {
		current_row.articleRow.animate({
			opacity: 1,
			duration: 500
		});
	};
	
	current_row = this;
	
	current_row.articleRow.animate({
		opacity: 0,
		duration: 500
	});
};