var current_row = null;

// var create_facebook_share = function(title, url){
	// var facebook_icon = Ti.UI.createImageView({
		// width: '50dp',
		// center: {x: 0.2 * Ti.Platform.displayCaps.platformWidth},
		// height: '50dp',
		// image: 'images/facebook.png',
		// url: url,
		// opacity: 1,
		// bubbleParent: false,
	// });
// 	
// 	
	// return facebook_icon;
// };
// 
// var create_twitter_share = function(title, url){
// 	
	// var twitter_icon = Ti.UI.createImageView({
		// width: '50dp',
		// center: {x: 0.4 * Ti.Platform.displayCaps.platformWidth},
		// height: '50dp',
		// image: 'images/twitter.png',
		// url: url,
		// opacity: 1,
		// bubbleParent: false,
	// });
// 	
// 	
	// return twitter_icon;
// };

var create_social_share = function(title, url){
	
	var email_icon = Ti.UI.createImageView({
		width: '36dp',
		center: {x: 0.4 * Ti.Platform.displayCaps.platformWidth},
		height: '36dp',
		image: 'images/social_share_inactive.png',
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
		
		intent.putExtra(Ti.Android.EXTRA_TEXT, title + ' - ' + url);
		activity.startActivity(Ti.Android.createIntentChooser(intent,'Share'));	
	});

	return email_icon;
};

var create_bookmarks = function(title, url, author, content, date, id, thumbnail){
	
	var image;
	if (db.exists(id)){
		image = 'images/Bookmarks-06.png';
	}
	else{
		image = 'images/Bookmarks-00.png';
	}
	
	var bookmark = Ti.UI.createImageView({
		width: '36dp',
		center: {x: 0.6 * Ti.Platform.displayCaps.platformWidth},
		height: '36dp',
		image: image,
		url: url,
		opacity: 1,
		bubbleParent: false,
	});
	
	bookmark.addEventListener('click',function(e){
		if (db.exists(id)){
			if (Ti.UI.currentWindow.id == 'bookmarks'){
				
				current_row.articleRow.animate({
					opacity: 1,
					duration: 500
				});
				
				tbl.deleteRow(current_row);
				if (tbl.data[0].rowCount == 0){
					tbl.setData([create_no_bookmarks_row()]);
				}
				current_row = null;
			}
			
			bookmark.animate({opacity:0, duration: 0}, function(){;
				bookmark.image = 'images/Bookmarks-00.png';
				bookmark.animate({opacity:1, duration: 350});
			});
			db.deleteId(id);
		}
		else{
			bookmark.animate({opacity:0, duration: 0}, function(){;
				bookmark.image = 'images/Bookmarks-06.png';
				bookmark.animate({opacity:1, duration: 350});
			});
			
			db.insert(id, title, content, url, author, date);
			if (thumbnail == 'images/default_thumb.png')
				db.update(thumbnail, id);
			else{
				var thumbnail_ext = thumbnail.split('.');
				var extension = '.' + thumbnail_ext[thumbnail_ext.length-1];
				get_remote_file('thumb_' + id + extension, thumbnail, db.update, id);
			}
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
		zIndex: 400,
	});

	//icons.add(create_facebook_share(title,url));
	//icons.add(create_twitter_share(title,url));\
	icons.social = create_social_share(title,url);
	icons.bookmark = create_bookmarks(title, url, author, content, date, id, thumbnail);
	icons.add(icons.social);
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

var get_remote_file =  function(filename, url, fn_end, id) {
	var file_obj = {file:filename, url:url, path: null};
 
	var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,filename);
	if ( file.exists() ) {
		file_obj.path = file.getNativePath();
		fn_end(file_obj.path, id);
	}
	else {
		if ( Titanium.Network.online ) {
			var loader = Titanium.Network.createHTTPClient();
 
			loader.setTimeout(10000);
			loader.onload = function()
			{
	 
				if (loader.status == 200 ) {
					var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,filename);
					f.write(this.responseData);
					file_obj.path = f.getNativePath();
					fn_end(file_obj.path, id);
				}
				else {
					file_obj.error = 'file not found'; // to set some errors codes
				}
            };
			loader.error = function(e)
			{
				file_obj.error = e.error;
				//fn_end(file_obj);
			};
			loader.open('GET',url);
			loader.send();           
		}
		else {
			file_obj.error = 'no internet';
			//fn_end(file_obj);
		} 
	}
};