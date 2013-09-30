var InfiniScroll = require('infini-scroll');
var win = Titanium.UI.currentWindow;
win.backgroundColor='white';

var refreshing = false;
var content_loaded = false;
var inifiniscrollView = null;
var thumbnailScrollView = null;
var scrollableGalleryView = null;
var galleryWindow = null;
var thumbPadding = 3;
var thumbSize;
var numberOfColumnLandscape = 8;
var numberOfColumnPortrait = 4;
var numberOfColumn;
var dpi = (Ti.Platform.displayCaps.dpi / 160);
var currentColumn = 0;
var currentRow = 0;
var yPosition = thumbPadding;
var xPosition = 0;
var imageId = 0;
var numOfImages = 0;
var allThumbs = [];
var isUiHidden = false;
//var buttonSize = { width : 25, height : 50};
var galleryImageViews = [];
var originalImages = [];
var	descriptionHeader = null;
var lastID = 0;
var recentID = 0;
var footerIcons;
//var buttonLeft = null;
//var buttonRight = null;

if (Ti.Platform.osname != 'android')
{
	win.layout = 'vertical';
	var common = require('ios-common');
	var header = common.create_header();
	win.add(header);
}

var create_activity_indicator = function(){
	var style;
	if (Ti.Platform.osname == 'android')
		style = Ti.UI.ActivityIndicatorStyle.BIG_DARK;
	else
		style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
		
	var activityIndicator = Ti.UI.createActivityIndicator({
		style: style ,
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
		
var create_loading_row = function(top){
		
	var loadingView = Ti.UI.createView({
		height: thumbSize,
		backgroundColor: 'black',
		opacity: 0.7,
	});	
	
	if (top)
		loadingView.top = 0;
	else
		loadingView.bottom = 0;		
	
	var loadingIndicator = create_activity_indicator();
	loadingView.add(loadingIndicator);
	loadingIndicator.show();
	return loadingView; 
};

var dialog;

if (Ti.Platform.osname == 'andoird') {
	dialog = function(title, msg){
		title = title || 'Couldn\'t fetch your articles';
		msg = msg || 'Please check internet connectivity';
		
		var notification = Titanium.UI.createNotification({
			message: title + '\n' + msg,
			duration: Ti.UI.NOTIFICATION_DURATION_LONG,
		}); 
		
		notification.addEventListener('click',function(){
			notification.hide();
		});
	notification.show();
	};
}
else{
	dialog = function(){
		title = 'Couldn\'t fetch your articles';
		msg = 'Please check internet connectivity';
		
		var dialog = Ti.UI.createAlertDialog({
			message: msg,
			title: title,
			ok: 'Got it!',
			cancel: -1,
		});
		dialog.show();
	};
}

var computeSizesforThumbGallery = function() {
	
	if (Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight) {// Landscape
		numberOfColumn = numberOfColumnLandscape;
	} else {
		numberOfColumn = numberOfColumnPortrait;
	}

	thumbSize = (Ti.Platform.displayCaps.platformWidth - ((numberOfColumn - 1) * thumbPadding)) / numberOfColumn;
};

/**
		 * Recompute the size of a given image size, in order to make it fit
		 * into the screen.
		 *
		 * @param {Number} width
		 *
		 * @param {Number} height
		 *
		 * @returns {Object} new width and the new height.
		 */
var reComputeImageSize = function(width, height) {

	var newWidth = width,
		newHeight = height;

	var margin = 100 * (Ti.Platform.displayCaps.dpi / 160);
	var viewWidth = Ti.Platform.displayCaps.platformWidth;
	var viewHeight = Ti.Platform.displayCaps.platformHeight;
	
	/*
	 * By working ratios of image sizes and screen sizes we ensure that, we will always
	 * start resizing the dimension (height or width) overflowing the screen. Thus, the resized image will
	 * always be contained by the screen boundaries.
	 */
	if ((width / viewWidth) >= (height / viewHeight)) {

		if (width > viewWidth) {
			newHeight = (height * viewWidth) / width;
			newWidth = viewWidth;

		} else if (height > viewHeight) {
			newWidth = (viewHeight) / height;
			newHeight = viewHeight;
		}

	} else {

		if (height > viewHeight) {
			newWidth = (width * viewHeight) / height;
			newHeight = viewHeight;

		} else if (width > viewWidth) {
			newHeight = (height * viewWidth) / width;
			newWidth = viewWidth;
		}

	}

	return {
		width : newWidth,
		height : newHeight
	};

};

/**
 * Recompute image size on orientation change.
 */
var reComputeImageSizeOnChange = function(index) {
	newSize = reComputeImageSize(allThumbs[index].imageInfo.fullWidth, allThumbs[index].imageInfo.fullHeight);
	
	scrollableGalleryView.views[index].children[0].height = newSize.height;
	scrollableGalleryView.views[index].children[0].width = newSize.width;
	scrollableGalleryView.views[index].children[0].center = {y: Ti.Platform.displayCaps.platformHeight/2};
	
};

/**
 * Recompute images size on orientation change.
 */
var reComputeImagesSizeOnChange = function() {

	// Iterating through gallery images.
	for (var i = 0, length = allThumbs.length; i < length; i++) {
		reComputeImageSizeOnChange(i);
	}
};

var reComputeImageGalleryOnOrientationChange = function() {

	computeSizesforThumbGallery();
	imageId = 0;
	currentColumn = 0;
	currentRow = 0;
	yPosition = thumbPadding;
	xPosition = 0;

	for (var i = 0, b = allThumbs.length; i < b; i++) {
	
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = 0;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}
	
		var currentThumb = allThumbs[i];
		currentThumb.imageId = imageId;
		currentThumb.width = thumbSize;
		currentThumb.height = thumbSize;
	
		currentThumb.left = xPosition;
		currentThumb.top = yPosition;

		// Increments values (thumb layout)
			currentColumn++;
			xPosition += thumbSize + thumbPadding;
			imageId++;
	}
	if (thumbnailScrollView && thumbnailScrollView.indicator){
		
		var xloading = xPosition;
		var yloading = yPosition;
		
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xloading = 0;
			yloading += thumbPadding + thumbSize;
		}
		
		var indicator = thumbnailScrollView.indicator;
		indicator.width = thumbSize;
		indicator.height = thumbSize;
		indicator.left = xloading;
		indicator.top = yloading;
	}
};	

var createGalleryWindow = function(imgId) {

	scrollableGalleryView = Ti.UI.createScrollableView({
		top : 0,
		views : [],
		maxZoomScale : 2.0,
		currentPage : imgId,
		showPagingControl: false,
	});
	
	// Create caption only when given by user.
	var opacity = allThumbs[imgId].imageInfo.caption == ''? 0 : 0.7;
	
	descriptionHeader = Titanium.UI.createView({
		height: '50dp',
		top: 0,
		opacity: opacity,
		backgroundColor: 'black',
	});
	
	var descriptionLabel = Ti.UI.createLabel({
		text: allThumbs[imgId].imageInfo.caption,
		center: {y:'25dp'},
		color: 'white',
		font: {fontSize: '15dp'},
		textAlign: 'center',
		zIndex: 2,
	});
	
	descriptionHeader.add(descriptionLabel);
	
	if (Ti.Platform.osname != 'android'){
		var closeButton = Titanium.UI.createImageView({
			image : 'images/gallery-exit.png',
			right: '10dp',
			top: '10dp',
			width: '30dp',
			height: '30dp',
		});
		
		closeButton.addEventListener('click', function(){
			galleryWindow.close();
		});	
	}
	
	
	var openArticle = Titanium.UI.createLabel({
		text: 'Read Article',
		font: {fontSize: '16dp', fontFamily: 'droidsans'},
		left : '60dp',
		bottom: '10dp',
		height: '30dp',
		color: 'white',
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
	
	footerIcons = Titanium.UI.createView({
		height: '50dp',
		bottom: 0,
		opacity: 0.7,
		backgroundColor: 'black',
	});
	
	footerIcons.add(sharePhoto);
	footerIcons.add(openArticle);
	
	var toggleUI = function() {

		if (isUiHidden) {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 0.7;

			if (descriptionHeader.children[0].text  != '')
				descriptionHeader.animate(animation);
			
			footerIcons.animate(animation);
				
		} else {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 0.0;

			if (descriptionHeader.children[0].text  != '')
				descriptionHeader.animate(animation);
				
			footerIcons.animate(animation);
		}
		
		isUiHidden = !isUiHidden;
	};
	
	for (var i = 0, b = allThumbs.length; i < b; i++) {
		var enlarged_image = Ti.UI.createImageView({
			image: allThumbs[i].imageInfo.path,
			center: {y: Ti.Platform.displayCaps.platformHeight/2},
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

	galleryWindow.add(descriptionHeader);
	galleryWindow.add(footerIcons);
	
	if (Ti.Platform.osname != 'android')
		galleryWindow.add(closeButton);
	
	scrollableGalleryView.addEventListener('scroll', function(e) {

		galleryWindow.title = e.currentPage + 1 + ' of ' + numOfImages;

		if (!isUiHidden){
			if(allThumbs[e.currentPage].imageInfo.caption == ''){
				descriptionHeader.opacity = 0;
			}
			else{
				descriptionHeader.opacity = 0.7;
			}
		}

		descriptionHeader.children[0].text = allThumbs[e.currentPage].imageInfo.caption;
	});
};

var createThumbGallery = function() {
	
	thumbnailScrollView = new InfiniScroll({
		top: 0,
		contentWidth: 'auto',
		contentHeight: 'auto',
		cacheSize: 7,
		showVerticalScrollIndicator: true,
		showHorizontalScrollIndicator: false,
	}, 
	{
  		triggerAt: '100%',
  		onScrollToEnd: function(){
			load_previous_photos();
		}
	});

	computeSizesforThumbGallery();
	win.add(thumbnailScrollView.view);
};

var addThumbsToGallery = function(imgs){
	numOfImages += imgs.length;
	
	for (var i = 0, b = imgs.length; i < b; i++) {
		
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = 0;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}

		var thumbPath = (typeof imgs[i].thumbPath == 'undefined') ?
						 imgs[i].path :
						 imgs[i].thumbPath;

		var thumbImage = Ti.UI.createImageView({
			image: thumbPath,
			width: thumbSize,
			height: thumbSize,
			imageId: imageId,
			left: xPosition,
			top: yPosition,
			backgroundColor: 'white',
			imageInfo: imgs[i],
		});

		thumbImage.addEventListener('click', function(e) {
			galleryWindow = Ti.UI.createWindow({
				backgroundColor : '#000',
				title : (e.source.imageId + 1) + ' of ' + numOfImages,
				translucent : true
			});
			
			Ti.Gesture.addEventListener('orientationchange', reComputeImagesSizeOnChange);
					
			galleryWindow.addEventListener('close', function() {
				Ti.Gesture.removeEventListener('orientationchange', reComputeImagesSizeOnChange);
				reComputeImageGalleryOnOrientationChange();
			});
	
			createGalleryWindow(e.source.imageId);
			
			galleryWindow.open({
				fullscreen : true,
				navBarHidden : true
			});
		});

		thumbnailScrollView.add(thumbImage);
		allThumbs.push(thumbImage);
		// Increments values (thumb layout)
		currentColumn++;
		xPosition += thumbSize + thumbPadding;
		imageId++;
	}
	thumbnailScrollView.wrapper.backgroundColor = 'white';
};

var addNewThumbsToGallery = function(imgs){
	numOfImages += imgs.length;
	
	currentColumn = 0;
	currentRow = 0;
	yPosition = 0;
	xPosition = thumbPadding;
	
	for (var i = 0, b = imgs.length; i < b; i++) {
		
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = 0;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}
		
		var thumbPath = (typeof imgs[i].thumbPath == 'undefined') ?
						 imgs[i].path :
						 imgs[i].thumbPath;
						 
		
		var thumbImage = Ti.UI.createImageView({
			image: thumbPath,
			width: thumbSize,
			height: thumbSize,
			imageId: imageId,
			left: xPosition,
			top: yPosition,
			backgroundColor: 'white',
			imageInfo: imgs[i],
		});

		thumbImage.add(thumbImage);

		thumbImage.addEventListener('click', function(e) {
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

		thumbnailScrollView.add(thumbImage);
		allThumbs.unshift(thumbImage);
		// Increments values (thumb layout)
		currentColumn++;
		xPosition += thumbSize + thumbPadding;
		imageId++;
	}
	
	reComputeImageGalleryOnOrientationChange();
};

var load_photos = function(){
		
	var network = Titanium.Network;
	var loader = Ti.Network.createHTTPClient({timeout: 15000});

	var send_request = function(e){
		if (e.online){
			network.removeEventListener('change', send_request);
			loader.open('GET','http://s6062.p9.sites.pressdns.com/category/photos/?json=1&count=20');
			loading_indicator.show();
			loader.send();
		}
	};
	
	loader.open('GET','http://s6062.p9.sites.pressdns.com/category/photos/?json=1&count=20');
	
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
						content : response.posts[i].content,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.full.url,
						fullWidth: attachment.images.full.width,
						fullHeight: attachment.images.full.height,
						imageTitle: attachment.title,
						imageId: attachment.id,
					};
					
					photos.push(photo);
				}
			}
			
			lastID = response.posts[i].id;
		}
		
		content_loaded = true;
		addThumbsToGallery(photos);
	
	};
	
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
	
	if (!content_loaded || refreshing)
		return;
	
	refreshing = true;
	
	var loadingRow = create_loading_row(true);
	win.add(loadingRow);
	
	var loader = Ti.Network.createHTTPClient({timeout: 15000});
	
	loader.open('GET','http://s6062.p9.sites.pressdns.com/api/adjacent/get_next_posts/?category=photos&count=20&id=' + recentID);
	
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
						content : response.posts[i].content,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.full.url,
						fullWidth: attachment.images.full.width,
						fullHeight: attachment.images.full.height,
						imageTitle: attachment.title,
						imageId: attachment.id,
					};
					
					photos.unshift(photo);
				}
			}
		}
		
		loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
		addNewThumbsToGallery(photos);
		refreshing = false;
	};
	
	loader.onerror = function(){
		loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
		refreshing = false;
	};
	loader.send();
};

var load_previous_photos = function(){

	var loader = Ti.Network.createHTTPClient({timeout: 15000});
	
	var loadingRow = create_loading_row(false);
	win.add(loadingRow);
	
	loader.open('GET','http://s6062.p9.sites.pressdns.com/api/adjacent/get_previous_posts/?category=photos&count=20&id=' + lastID);
	
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
						content : response.posts[i].content,
						thumbnail : response.posts[i].attachments[0].images.thumbnail.url,
						date : response.posts[i].date,
						author :  response.posts[i].author.name,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.full.url,
						fullWidth: attachment.images.full.width,
						fullHeight: attachment.images.full.height,
						imageTitle: attachment.title,
						imageId: attachment.id,

					};
					photos.push(photo);
				}
			}
			lastID = response.posts[i].id;
		}
		loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
		addThumbsToGallery(photos);
	};
	
	loader.onerror = function(){
		loadingRow.animate(fade(0, function(){win.remove(loadingRow);}));
	};
	
	loader.send();
};

var open_article = function(index){
	
	var image = allThumbs[index].imageInfo;

	var articleWindow = Ti.UI.createWindow({
		backgroundColor:'#fff',
		url: 'detail.js',
		modal: false,
		navBarHidden: true,
		id: image.id,
		articleUrl: image.url,
		articleTitle: image.caption,
		thumbnail: image.thumbnail,
		date: image.date,
		author: image.author,
		content: image.content,
	});
	
	// articleWindow.addEventListener('open', function(e) {
		// setTimeout(function(){
		// var actionBar = articleWindow.getActivity().actionBar;
			// if (actionBar){
				// actionBar.icon = "images/header-logo.png";
				// actionBar.title = "";
				// actionBar.displayHomeAsUp = true;
				// actionBar.onHomeIconItemSelected = function() {
					// articleWindow.close();
				// };
			// }
		// }, 500);
	// });
		
	articleWindow.open({
		animated:true,
	});
};

var share_photo = function(index){
	
	if(Ti.Platform.osname == 'android'){	
		var image = allThumbs[index].imageInfo;
		
		var activity = Ti.Android.currentActivity;
		var intent = Ti.Android.createIntent({
			action: Ti.Android.ACTION_SEND,
			type: 'text/plain'
		});
			
		intent.putExtra(Ti.Android.EXTRA_TEXT, image.path);
		intent.putExtra(Ti.Android.EXTRA_SUBJECT, image.caption);
		activity.startActivity(Ti.Android.createIntentChooser(intent,'Share'));
	}
	else{		
		Ti.include('ios-sharing.js');
		
		var image = allThumbs[index].imageInfo;
		
		var dialog = Ti.UI.createOptionDialog({
			title: "Share",
			options: ['Twitter', 'Facebook', 'Mail', 'Cancel'],
			cancel: 3,
		});
	 
		dialog.addEventListener('click', function(e) {
			if(e.index == e.cancel) { 
				return; 
			}
			
			var sharer = null;
			var shareTitle;
	
			switch(e.index) {
				case 0:
					sharer = 'Twitter';
					shareTitle = '@dohanews ' + image.caption;
					break;
				case 1:
					sharer = 'Facebook';
					shareTitle = image.caption;
					break;
				case 2:
					sharer = 'Mail';
					shareTitle = image.caption;
					break;
			}
		 
			if (sharer == 'Mail'){
				var emailDialog = Ti.UI.createEmailDialog({
					subject: shareTitle,
					messageBody: image.path,
				});
				emailDialog.open();
			}
			else{
				sharekit.share({
					title: shareTitle,
					link: image.path,
					sharer: sharer,
					view: share
				});
			}
		});
		
		dialog.show();
	}	
};

var download_photo = function(index){
	var image = allThumbs[index].imageInfo;
	
	var url = image.path;
	var thumbnail_ext = url.split('.');
	var ext = '.' + thumbnail_ext[thumbnail_ext.length-1];
	var filename = image.imageTitle + '_' + image.imageId + '.' + ext;
	
	var file_obj = {file:filename, url:url, path: null};
};

createThumbGallery();

load_photos();

win.addEventListener('blur', function() {
	Ti.Gesture.removeEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
});

win.addEventListener('focus', function() {
	reComputeImageGalleryOnOrientationChange();
	Ti.Gesture.addEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
	
	// if (Ti.Platform.osname == 'android'){
		// Ti.App.tabgroup.getActivity().onPrepareOptionsMenu = function(e){
			// var menu = e.menu;
			// menu.findItem(1).visible = false;
			// if (Ti.App.refreshArticles)
				// menu.findItem(2).removeEventListener('click', Ti.App.refreshArticles);
// 	
			// menu.findItem(2).addEventListener('click', Ti.App.load_new_photos);
		// }
// 		
		// Ti.App.tabgroup.activity.invalidateOptionsMenu();
	// }
});
