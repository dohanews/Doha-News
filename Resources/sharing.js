var current_row = null;

var post_to_facebook = function(title, url){
	fb.addEventListener('login', function(e) {
	    if (e.success) {
			console.log('Logged In');
			Ti.App.fbLoggedIn = true;
			fb.dialog('feed', 
			{
				link: url,
				name: title
			},
			function(){
				alert('posted');
			});
	    } else if (e.error) {
	        alert(e.error);
	    } else if (e.cancelled) {
	        alert("Cancelled");
	    }
	});

	fb.authorize();		
};

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
	
	facebook_icon.addEventListener('click',function(e){
		console.log(url);
		if (!Ti.App.fbLoggedIn)
		{
			if(fb.getLoggedIn())
			{
				fb.addEventListener('logout', function(e) {
					
					var client = Titanium.Network.createHTTPClient();
					client.clearCookies('https://login.facebook.com');
					post_to_facebook(title, url);
								
				});
				fb.logout();
			}
			else
			{
				post_to_facebook(title, url);
			}
		}
		else
		{
			fb.dialog('feed', 
				{
					link: url,
					name: title
				},
				function(){
					alert('posted');
				});
		}
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
	
	twitter_icon.addEventListener('click',function(e){
		if (!Ti.App.Properties.getString('twitterAccessTokenKey')){
			sharing_client = Twitter({
				consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  				consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
			});
			
			sharing_client.addEventListener('login', function(e){
				if (e.success){
					Ti.App.Properties.setString('twitterAccessTokenKey', e.accessTokenKey);
					Ti.App.Properties.setString('twitterAccessTokenSecret', e.accessTokenSecret);
					console.log('logged in!');
					console.log(Ti.App.Properties.getString('twitterAccessTokenKey'));
					console.log(Ti.App.Properties.getString('twitterAccessTokenSecret'));
				}
				else{
					console.log('error logging in');
				}
			});
			
			sharing_client.authorize();
		}
		else{
			console.log(Ti.App.Properties.getString('twitterAccessTokenKey'));
			console.log(Ti.App.Properties.getString('twitterAccessTokenSecret'));
		}
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
				
				if (isAndroid)
					current_row.articleRow.animate({opacity:1});
				else
					current_row.articleRow.left.animate({left: 0});
					
				tbl.deleteRow(current_row, isAndroid? {} : {animationStyle:Ti.UI.iPhone.RowAnimationStyle.RIGHT});
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

if (Ti.Platform.osname == 'android'){
	sharing_animation = function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				opacity: 1,
				duration: 500
			});
		};
		
		current_row = this; // it looks like android does not have the e.row property for this event.
		
		current_row.articleRow.animate({
			opacity: 0,
			duration: 500
		});
	}
}
else{
	sharing_animation = function(e) {
		if (!!current_row) {
			current_row.articleRow.animate({
				left: 0,
				duration: 500
			});
		};
		
		current_row = e.row; // it looks like android does not have the e.row property for this event.
		
		current_row.articleRow.animate({
			left: -Ti.Platform.displayCaps.platformWidth,
			duration: 500
		});
	}
}
