var current_row = null;

var sharekit = require('com.0x82.sharekit');

sharekit.configure({
	my_app_name: 'Doha News',
	my_app_url: 'http://www.dohanews.co',
	
	  // See documentation/configuration.html to configure the twitter module
	twitter_consumer_key: 'FDgfEjNPwqLnZq7xlJuA',
	twitter_consumer_secret: 'kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw',
	twitter_callback_url: 'http://dev.dohanews.co',
	
	bit_ly_login: 'dohanewstest',
	bit_ly_key: 'f98deb953cd1959fc99f65da1dc88b355396e9ec',
	
	facebook_key: '520290184684825',
	
	bar_style: "UIBarStyleDefault",
	
	form_font_color_red: -1,
	form_font_color_green: -1,
	form_font_color_blue: -1,
	form_bg_color_red: -1,
	form_bg_color_green: -1,
	form_bg_color_blue: -1,
	
	ipad_modal_presentation_style: "UIModalPresentationFormSheet",
	ipad_modal_transition_style: "UIModalTransitionStyleCoverVertical",
	
	use_placeholders: true,
	
	max_fav_count: 3,
	allow_offline: true,
	allow_auto_share: true
});

var create_facebook_share = function(title, url){
	var facebook_icon = Ti.UI.createImageView({
		width: '36dp',
		left: '10dp',
		height: '36dp',
		image: 'images/social_fb.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	facebook_icon.addEventListener('click', function(e) {
		console.log('clicked');
	  	sharekit.share({
	  		title: title,
			link: url,
	    	view: facebook_icon,
	    	sharer: 'Facebook',
	  	});
	});

	return facebook_icon;
};

var create_twitter_share = function(title, url){
	
	var twitter_icon = Ti.UI.createImageView({
		width: '36dp',
		left: '90dp',
		height: '36dp',
		image: 'images/social_twitter.png',
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	twitter_icon.addEventListener('click', function(e) {
	  	sharekit.share({
			title: title + ' @dohanews',
			link: url,
	    	view: twitter_icon,
	    	sharer: 'Twitter',
	  	});
	});
	
	return twitter_icon;
};

var create_email_share = function(title, url){
	
	var email_icon = Ti.UI.createImageView({
		width: '36dp',
		left: '170dp',
		height: '36dp',
		image: 'images/social_email.png',
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


var animate = function(imageView, images, duration, callback){
	var i = 0;
	
	var ndx = setInterval(function(){
		imageView.image = images[i++];
		if(i == images.length){
			clearInterval(ndx);
			if (callback)
				callback();
		}
	}, duration);
}

var create_bookmarks = function(title, url, author, content, date, id){
	
	var image;
	if (db.exists(id)){
		image = 'images/Bookmarks-06.png';
	}
	else{
		image = 'images/Bookmarks-00.png';
	}
	
	var bookmark = Ti.UI.createImageView({
		width: '36dp',
		left: '250dp',
		height: '36dp',
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
					left: 0,
					duration: 500
				});
					
				tbl.deleteRow(current_row, {animationStyle:Ti.UI.iPhone.RowAnimationStyle.RIGHT});
				current_row = null;
			}

			animate(bookmark,
				['images/Bookmarks-06.png',
				'images/Bookmarks-05.png',
				'images/Bookmarks-04.png',
				'images/Bookmarks-03.png',
				'images/Bookmarks-02.png',
				'images/Bookmarks-01.png',]
				, 30, function(){
					bookmark.opacity = 0;
					bookmark.image = 'images/Bookmarks-00.png'
					bookmark.animate({opacity:1, duration: 250});
			});
			db.deleteId(id);
			
		}
		else{
			db.insert(id, title, content, url, author, date);
			bookmark.animate({opacity: 0, duration: 250}, 
				function(){
					bookmark.image = null;
					bookmark.opacity = 1;
					animate(bookmark, 
						['images/Bookmarks-01.png',
						'images/Bookmarks-02.png',
						'images/Bookmarks-03.png',
						'images/Bookmarks-04.png',
						'images/Bookmarks-05.png',
						'images/Bookmarks-06.png'], 30);
			});
		}
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

var sharing_animation = function(e) {
	if (!!current_row) {
		current_row.articleRow.animate({
			left: 0,
			duration: 500
		});
	};
	
	current_row = e.row;
	
	if (e.direction == 'left')
		current_row.articleRow.animate({
			left: -Ti.Platform.displayCaps.platformWidth,
			duration: 500
		});
	else
		current_row.articleRow.animate({
			left: Ti.Platform.displayCaps.platformWidth,
			duration: 500
		});
};