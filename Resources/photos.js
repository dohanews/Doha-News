var InfiniScroll = require('infini-scroll');
var win = Titanium.UI.currentWindow;
win.backgroundColor='white';

var content_loaded = false;
var inifiniscrollView = null;
var thumbnailScrollView = null;
var scrollableGalleryView = null;
var galleryWindow = null;
var thumbPadding = 0;
var thumbSize;
var numberOfColumnLandscape = 8;
var numberOfColumnPortrait = 4;
var numberOfColumn;
var dpi = (Ti.Platform.displayCaps.dpi / 160);
var currentColumn = 0;
var currentRow = 0;
var yPosition = thumbPadding;
var xPosition = thumbPadding;
var imageId = 0;
var numOfImages = 0;
var allThumbs = [];
var isUiHidden = false;
//var buttonSize = { width : 25, height : 50};
var galleryImageViews = [];
var originalImages = [];
var	descriptionLabel = null;
var lastID = 0;
var recentID = 0;
//var buttonLeft = null;
//var buttonRight = null;

var create_activity_indicator = function(){
	
	var activityIndicator = Ti.UI.createActivityIndicator({
		style: Ti.UI.ActivityIndicatorStyle.BIG_DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});

	return activityIndicator;
};

var dialog = function(title, msg){
	title = title || 'Couldn\'t fetch your articles';
	msg = msg || 'Please check internet connectivity';
	
	var notification = Titanium.UI.createNotification({
		message: title + '\n' + msg,
		duration: Ti.UI.NOTIFICATION_DURATION_LONG,
	}) 
	
	notification.addEventListener('click',function(){
		notification.hide();
	})
	notification.show();
}

var computeSizesforThumbGallery = function() {
	
	if (Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight) {// Landscape
		numberOfColumn = numberOfColumnLandscape;
	} else {
		numberOfColumn = numberOfColumnPortrait;
	}

	thumbSize = (Ti.Platform.displayCaps.platformWidth - ((numberOfColumn + 1) * thumbPadding)) / numberOfColumn;
}

var reComputeImageGalleryOnOrientationChange = function() {

	computeSizesforThumbGallery();
	imageId = 0;
	currentColumn = 0;
	currentRow = 0;
	yPosition = thumbPadding;
	xPosition = thumbPadding;

	for (var i = 0, b = allThumbs.length; i < b; i++) {
	
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = thumbPadding;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}
	
		var currentThumb = allThumbs[i];
		currentThumb.imageId = imageId;
		currentThumb.width = thumbSize;
		currentThumb.height = thumbSize;
	
		currentThumb.left = xPosition;
		currentThumb.top = yPosition;
	
		var dpifactor = dpi;
		
		currentThumb.children[0].imageId = imageId;
		currentThumb.children[0].width = (thumbSize - (6 * dpifactor));
		currentThumb.children[0].height = (thumbSize - (6 * dpifactor));
	
		currentThumb.children[0].top = (3 * dpifactor);
		currentThumb.children[0].left = (3 * dpifactor);
	
		// Increments values (thumb layout)
			currentColumn++;
			xPosition += thumbSize + thumbPadding;
			imageId++;
	}
}	
	
var createGalleryWindow = function(imgId) {

	scrollableGalleryView = Ti.UI.createScrollableView({
		top : 0,
		views : [],
		maxZoomScale : 2.0,
		currentPage : imgId,
		showPagingControl: false,
	});
	
	// Create caption only when given by user.
	var descriptionLabel = null;
	
	descriptionLabel = Ti.UI.createLabel({
		text: allThumbs[imgId].imageInfo.caption,
		center: {y:'25dp'},
		height: 'auto',
		color: 'white',
		font: {fontSize: '15dp'},
		textAlign: 'center',
		zIndex: 2,
	});
	
	var openArticle = Titanium.UI.createImageView({
		image : 'images/gallery-article.png',
		left : '50dp',
		bottom: '10dp',
		width: '30dp',
		height: '30dp',
	});
	
	openArticle.addEventListener('click', function(){
		open_article(scrollableGalleryView.currentPage);
	});
	
	var sharePhoto = Titanium.UI.createImageView({
		image : 'images/gallery-social-share.png',
		left : '10dp',
		bottom: '10dp',
		width: '30dp',
		height: '30dp',
	});
	
	sharePhoto.addEventListener('click', function(){
		share_photo(scrollableGalleryView.currentPage);
	});
	
	var footerIcons = Titanium.UI.createView({
		width: Ti.Platform.displayCaps.platformWidth,
		height: '50dp',
		bottom: 0,
		backgroundColor: 'transparent'
	})
	
	footerIcons.add(sharePhoto);
	footerIcons.add(openArticle);
	
	// var closeButton = Titanium.UI.createImageView({
		// image : 'images/gallery-exit.png',
		// right : '10dp',
		// center: {y: '25dp'},
		// width: '30dp',
		// height: '30dp',
	// });
// 	
	// closeButton.addEventListener('click', function(){
		// win.close();
	// });
	
	// buttonLeft = Titanium.UI.createButton({
		// image : 'images/left_arrow.png',
		// backgroundImage : 'images/invisible_hack.png',
		// left : 10,
		// //width : buttonSize.width * dpi,
		// //height : buttonSize.height * dpi,
		// center: {y: Ti.Platform.displayCaps.platformHeight / 2},
	// });
// 	
	// buttonRight = Titanium.UI.createButton({
		// image : 'images/right_arrow.png',
		// backgroundImage : 'images/invisible_hack.png',
		// right : 10,
		// //width : buttonSize.width * dpi,
		// //height : buttonSize.height * dpi,
		// center: {y: Ti.Platform.displayCaps.platformHeight / 2},
	// });
// 	
	// buttonLeft.addEventListener('click', function(e) {
		// var i = scrollableGalleryView.currentPage;
		// if (i == 0) {
			// return;
		// }
		// scrollableGalleryView.scrollToView(++i);
	// });
// 
	// buttonRight.addEventListener('click', function(e) {
		// var i = scrollableGalleryView.currentPage;
		// if (i == (scrollableGalleryView.views.length - 1)) {
			// return;
		// }
		// scrollableGalleryView.scrollToView(++i);
	// });
	
	var toggleUI = function() {

		if (isUiHidden) {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 1.0;

			if (descriptionLabel != null)
				descriptionLabel.animate(animation);
			
			footerIcons.animate(animation);
			// if (scrollableGalleryView.currentPage != (scrollableGalleryView.views.length - 1)) {
				// buttonRight.animate(animation);
			// }
// 
			// if (scrollableGalleryView.currentPage != 0) {
				// buttonLeft.animate(animation);
			// }
				
		} else {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 0.0;

			descriptionLabel.animate(animation);
			footerIcons.animate(animation);
// 
			// if (scrollableGalleryView.currentPage != (scrollableGalleryView.views.length - 1)) {
				// buttonRight.animate(animation);
			// }
// 
			// if (scrollableGalleryView.currentPage != 0) {
				// buttonLeft.animate(animation);
			// }
		}
		
		isUiHidden = !isUiHidden;
	}
	
	if (Ti.Platform.osname == 'android') {
	
		for (var i = 0, b = allThumbs.length; i < b; i++) {
			var enlarged_image = Ti.UI.createImageView({
				image: allThumbs[i].imageInfo.path,
				top: '50dp',
				bottom: '50dp',
			});

			var view = Ti.UI.createView({
				backgroundColor: 'black',
				width: Ti.Platform.displayCaps.platformWidth,
				image: enlarged_image,
			});
			
			view.add(enlarged_image);
			
			galleryImageViews[i] = view;

			view.addEventListener('singletap', toggleUI);
		}
	
		scrollableGalleryView.views = galleryImageViews;
		galleryWindow.add(scrollableGalleryView);
		scrollableGalleryView.scrollToView(imgId);
	
	} else {
	
		for (var i = 0, b = dictionary.images.length; i < b; i++) {
	
			var view = Ti.UI.createView({
				backgroundColor : '#000',
				image: images[i].path,
				height: 'auto',
				width: 'auto',
				index: i,
				firstLoad: true
			});
	
			view.addEventListener('load', function (e) {
				var blob = e.source.toBlob();
				originalImages[e.source.index] = blob;
	
				if (blob.height > 0 && blob.width > 0) {
					images[e.source.index].height = blob.height;
					images[e.source.index].width = blob.width;
	
					e.source.firstLoad = false;
				}
			});
	
			images[i].height = view.size.height
			images[i].width = view.size.width
	
			view.addEventListener('singletap', toggleUI);
	
			galleryImageViews[i] = view;
		}
	
		scrollableGalleryView.views = galleryImageViews;
		galleryWindow.add(scrollableGalleryView);
		scrollableGalleryView.scrollToView(imgId);
	}

	galleryWindow.add(descriptionLabel);
	galleryWindow.add(footerIcons);
	//galleryWindow.add(closeButton);

	//galleryWindow.add(buttonLeft);
	//galleryWindow.add(buttonRight);

	// if (scrollableGalleryView.currentPage == (scrollableGalleryView.views.length - 1)) {
		// buttonRight.visible = false;
	// }
	// if (scrollableGalleryView.currentPage == 0) {
		// buttonLeft.visible = false;
	// }

	scrollableGalleryView.addEventListener('scroll', function(e) {

		galleryWindow.title = e.currentPage + 1 + ' of ' + numOfImages;

		if (typeof allThumbs[e.currentPage].imageInfo.caption == 'undefined' || allThumbs[e.currentPage].imageInfo.caption == 'undefined') {
			allThumbs[e.currentPage].imageInfo.caption = '';
		}

		descriptionLabel.text = allThumbs[e.currentPage].imageInfo.caption;

		// if (!isUiHidden) {
			// if (e.currentPage == (scrollableGalleryView.views.length - 1)) {
				// buttonRight.visible = false;
			// } else {
				// buttonRight.visible = true;
			// }
// 
			// if (e.currentPage == 0) {
				// buttonLeft.visible = false;
			// } else {
				// buttonLeft.visible = true;
			// }
		// }
	});
}

var createThumbGallery = function() {
	
	thumbnailScrollView = new InfiniScroll({
		top: 0,
		contentWidth: 'auto',
		contentHeight: 'auto',
		showVerticalScrollIndicator: true,
		showHorizontalScrollIndicator: false,
	}, 
	{
  		triggerAt: '82%',
  		onScrollToEnd: function(){
			load_previous_photos();
		}
	});

	// thumbnailScrollView = Ti.UI.createScrollView({
		// top: 0,
		// contentWidth: 'auto',
		// contentHeight: 'auto',
		// showVerticalScrollIndicator: true,
		// showHorizontalScrollIndicator: false,
	// });

	computeSizesforThumbGallery();
	win.add(thumbnailScrollView.view);
}

var addThumbsToGallery = function(imgs){
	numOfImages += imgs.length;
	
	for (var i = 0, b = imgs.length; i < b; i++) {
		
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = thumbPadding;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}

		// Border of the thumbnail (make the thumbnail look a bit like a real picture).
		var thumbImageBorder = Ti.UI.createView({
			width: thumbSize,
			height: thumbSize,
			imageId: imageId,
			left: xPosition,
			top: yPosition,
			backgroundColor: 'white',
			borderColor:'black',
			borderWidth: '1dp',
			imageInfo: imgs[i],
		});

		var thumbPath = (typeof imgs[i].thumbPath == 'undefined') ?
						 imgs[i].path :
						 imgs[i].thumbPath;

		var dpifactor = dpi;

		var thumbImage = Ti.UI.createImageView({
			image: thumbPath,
			imageId : imageId,
			width : (thumbSize - (6 * dpifactor)),
			height : (thumbSize - (6 * dpifactor)),
			top : (3 * dpifactor),
			left : (3 * dpifactor),
		});

		thumbImageBorder.add(thumbImage);

		thumbImageBorder.addEventListener('click', function(e) {
			galleryWindow = Ti.UI.createWindow({
				backgroundColor : '#000',
				title : (e.source.imageId + 1) + ' of ' + numOfImages,
				translucent : true
			});

			galleryWindow.addEventListener('close', function() {
				reComputeImageGalleryOnOrientationChange();
			});
	
			createGalleryWindow(e.source.imageId);
			
			galleryWindow.open({
				fullscreen : true,
				navBarHidden : true
			});
		});

		thumbnailScrollView.add(thumbImageBorder);
		allThumbs.push(thumbImageBorder);
		// Increments values (thumb layout)
		currentColumn++;
		xPosition += thumbSize + thumbPadding;
		imageId++;
	}
}

var addNewThumbsToGallery = function(imgs){
	numOfImages += imgs.length;
	
	currentColumn = 0;
	currentRow = 0;
	yPosition = thumbPadding;
	xPosition = thumbPadding;
	
	for (var i = 0, b = imgs.length; i < b; i++) {
		
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = thumbPadding;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}

		// Border of the thumbnail (make the thumbnail look a bit like a real picture).
		var thumbImageBorder = Ti.UI.createView({
			width: thumbSize,
			height: thumbSize,
			imageId: imageId,
			left: xPosition,
			top: yPosition,
			backgroundColor: 'white',
			borderColor:'black',
			borderWidth: '1dp',
			imageInfo: imgs[i],
		});

		var thumbPath = (typeof imgs[i].thumbPath == 'undefined') ?
						 imgs[i].path :
						 imgs[i].thumbPath;

		var dpifactor = dpi;

		var thumbImage = Ti.UI.createImageView({
			image: thumbPath,
			imageId : imageId,
			width : (thumbSize - (6 * dpifactor)),
			height : (thumbSize - (6 * dpifactor)),
			top : (3 * dpifactor),
			left : (3 * dpifactor),
		});

		thumbImageBorder.add(thumbImage);

		thumbImageBorder.addEventListener('click', function(e) {
			galleryWindow = Ti.UI.createWindow({
				backgroundColor : '#000',
				title : (e.source.imageId + 1) + ' of ' + numOfImages,
				translucent : true
			});

			galleryWindow.addEventListener('close', function() {
				reComputeImageGalleryOnOrientationChange();
			});

			createGalleryWindow(e.source.imageId);
			
			galleryWindow.open({
				fullscreen : true,
				navBarHidden : true
			});
		});

		thumbnailScrollView.add(thumbImageBorder);
		allThumbs.unshift(thumbImageBorder);
		// Increments values (thumb layout)
		currentColumn++;
		xPosition += thumbSize + thumbPadding;
		imageId++;
	}
	
	reComputeImageGalleryOnOrientationChange();
}

var load_photos = function(){
		
	var network = Titanium.Network;
	var loader = Ti.Network.createHTTPClient({timeout: 15000});

	var send_request = function(e){
		if (e.online){
			network.removeEventListener('change', send_request);
			loader.open('GET','http://dndev.staging.wpengine.com/category/photos/?json=1&count=20');
			loading_indicator.show();
			loader.send();
		}
	}
	
	loader.open('GET','http://dndev.staging.wpengine.com/category/photos/?json=1&count=20');
	
	loader.onload = function(){
		var photos = [];
		var response = JSON.parse(this.responseText);
		
		if (response.posts.length > 0)
			recentID = response.posts[0].id;
			
		var imageMime = /^image/;
		loading_indicator.hide();
		
		for (var i = 0; i < response.posts.length; i++){
			
			for (var y = 0; y < response.posts[i].attachments.length; y++){
				var attachment = response.posts[i].attachments[y];
				
				if (imageMime.test(attachment.mime_type)){
					var photo = {
						id: response.posts[i].id,				
						url : response.posts[i].url,
						caption : response.posts[i].title,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.large.url,
						imageTitle: attachment.title,
						imageId: attachment.id,
					}
					
					photos.push(photo);
				}
			}
			
			lastID = response.posts[i].id;
		}
		
		content_loaded = true;
		addThumbsToGallery(photos);
	
	}
	
	var loading_indicator = create_activity_indicator();	
	win.add(loading_indicator);

	loading_indicator.show();
		
	loader.onerror = function(e){
		network.addEventListener('change', send_request);
		dialog();
		loading_indicator.hide();
	};
	
	loader.send();
};

Ti.App.load_new_photos = function(){
	
	if (!content_loaded)
		return;

	alert('fetching');
	var loader = Ti.Network.createHTTPClient({timeout: 15000});
	
	loader.open('GET','http://dndev.staging.wpengine.com/api/adjacent/get_next_posts/?category=photos&count=20&id=' + recentID);
	
	loader.onload = function(){

		var photos = [];
		var response = JSON.parse(this.responseText);
		
		if (response.posts.length > 0)
			recentID = response.posts[0].id;
			
		var imageMime = /^image/;
		for (var i = 0; i < response.posts.length; i++){
			
			for (var y = 0; y < response.posts[i].attachments.length; y++){
				var attachment = response.posts[i].attachments[y];
				
				if (imageMime.test(attachment.mime_type)){
					var photo = {
						id: response.posts[i].id,				
						url : response.posts[i].url,
						caption : response.posts[i].title,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.large.url,
						imageTitle: attachment.title,
						imageId: attachment.id,
					}
					
					photos.unshift(photo);
				}
			}
		}
		
		addNewThumbsToGallery(photos);
	
	}
	loader.send();
}

var load_previous_photos = function(){

	var loader = Ti.Network.createHTTPClient({timeout: 15000});
	
	loader.open('GET','http://dndev.staging.wpengine.com/api/adjacent/get_previous_posts/?category=photos&count=20&id=' + lastID);
	
	loader.onload = function(){
		var photos = [];
		var response = JSON.parse(this.responseText);
		
		if (response.posts.length <= 0)
			return;
			
		var imageMime = /^image/;
		for (var i = 0; i < response.posts.length; i++){
			
			for (var y = 0; y < response.posts[i].attachments.length; y++){
				var attachment = response.posts[i].attachments[y];
				
				if (imageMime.test(attachment.mime_type)){
					var photo = {
						id: response.posts[i].id,				
						url : response.posts[i].url,
						caption : response.posts[i].title,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.large.url,
						imageTitle: attachment.title,
						imageId: attachment.id,
					}
					photos.push(photo);
				}
			}
			lastID = response.posts[i].id;
		}
		addThumbsToGallery(photos);
		
	}
	loader.send();
};

var open_article = function(index){
	
	var image = allThumbs[index].imageInfo;
	
	var win = Ti.UI.createWindow({
		backgroundColor:'#fff',
		url: 'detail.js',
		modal: true,
		navBarHidden: true,
		id: image.id,
		articleUrl: image.url,
		articleTitle: image.caption,
		thumbnail: image.thumbnail,
		date: image.date,
		author: image.author,
	});
		
	win.open({
		animated:true,
	});
};

var share_photo = function(index){
	
	var image = allThumbs[index].imageInfo;
	
	var activity = Ti.Android.currentActivity;
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_SEND,
		type: 'text/plain'
	});
		
	intent.putExtra(Ti.Android.EXTRA_TEXT, image.path);
	intent.putExtra(Ti.Android.EXTRA_SUBJECT, image.caption);
	activity.startActivity(Ti.Android.createIntentChooser(intent,'Share'));	
};

var download_photo = function(index){
	var image = allThumbs[index].imageInfo;
	
	var url = image.path;
	var thumbnail_ext = url.split('.');
	var ext = '.' + thumbnail_ext[thumbnail_ext.length-1];
	var filename = image.imageTitle + '_' + image.imageId + '.' + ext;
	
	var file_obj = {file:filename, url:url, path: null};
}

createThumbGallery();

load_photos();

win.addEventListener('blur', function() {
	Ti.Gesture.removeEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
});

win.addEventListener('focus', function() {
	Ti.Gesture.addEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
	
	Ti.App.tabgroup.getActivity().onPrepareOptionsMenu = function(e){
		var menu = e.menu;
		menu.findItem(1).visible = false;
		if (Ti.App.refreshArticles)
			menu.findItem(2).removeEventListener('click', Ti.App.refreshArticles);

		menu.findItem(2).addEventListener('click', Ti.App.load_new_photos);
	}
	
	Ti.App.tabgroup.activity.invalidateOptionsMenu();
});
