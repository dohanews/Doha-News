var win = Titanium.UI.currentWindow;
win.backgroundColor='white';

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
var images = [];
var isUiHidden = false;
var buttonSize = { width : 25, height : 50};
var galleryImageViews = [];
var originalImages = [];
var	descriptionLabel = null;
var buttonLeft = null;
var buttonRight = null;

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
	
	currentColumn = 0;
	currentRow = 0;
	yPosition = thumbPadding;
	xPosition = thumbPadding;
	
	for (var i = 0, b = thumbnailScrollView.children.length; i < b; i++) {
	
		if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
			xPosition = thumbPadding;
			yPosition += thumbPadding + thumbSize;
			currentRow++;
		}
	
		var currentThumb = thumbnailScrollView.children[i];
	
		currentThumb.width = thumbSize;
		currentThumb.height = thumbSize;
	
		currentThumb.left = xPosition;
		currentThumb.top = yPosition;
	
		var dpifactor = dpi;

		currentThumb.children[0].width = (thumbSize - (6 * dpifactor));
		currentThumb.children[0].height = (thumbSize - (6 * dpifactor));
	
		currentThumb.children[0].top = (3 * dpifactor);
		currentThumb.children[0].left = (3 * dpifactor);
	
		// Increments values (thumb layout)
			currentColumn++;
			xPosition += thumbSize + thumbPadding;
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
		text: images[imgId].caption,
		bottom: '15dp',
		height: 'auto',
		color: 'white',
		font: {fontSize: 16},
		textAlign: 'center',
		zIndex: 2,
	});
	
	buttonLeft = Titanium.UI.createButton({
		image : 'images/left_arrow.png',
		backgroundImage : 'images/invisible_hack.png',
		left : 10,
		//width : buttonSize.width * dpi,
		//height : buttonSize.height * dpi,
		center: {y: Ti.Platform.displayCaps.platformHeight / 2},
	});
	
	buttonRight = Titanium.UI.createButton({
		image : 'images/right_arrow.png',
		backgroundImage : 'images/invisible_hack.png',
		right : 10,
		//width : buttonSize.width * dpi,
		//height : buttonSize.height * dpi,
		center: {y: Ti.Platform.displayCaps.platformHeight / 2},
	});
	
	buttonLeft.addEventListener('click', function(e) {
		var i = scrollableGalleryView.currentPage;
		if (i == 0) {
			return;
		}
		scrollableGalleryView.scrollToView(++i);
	});

	buttonRight.addEventListener('click', function(e) {
		var i = scrollableGalleryView.currentPage;
		if (i == (scrollableGalleryView.views.length - 1)) {
			return;
		}
		scrollableGalleryView.scrollToView(++i);
	});
	
	var toggleUI = function() {

		if (isUiHidden) {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 1.0;

			if (descriptionLabel != null)
				descriptionLabel.animate(animation);
			
			if (scrollableGalleryView.currentPage != (scrollableGalleryView.views.length - 1)) {
				buttonRight.animate(animation);
			}

			if (scrollableGalleryView.currentPage != 0) {
				buttonLeft.animate(animation);
			}
				
		} else {

			var animation = Titanium.UI.createAnimation();
			animation.duration = 300;
			animation.opacity = 0.0;

			descriptionLabel.animate(animation);

			if (scrollableGalleryView.currentPage != (scrollableGalleryView.views.length - 1)) {
				buttonRight.animate(animation);
			}

			if (scrollableGalleryView.currentPage != 0) {
				buttonLeft.animate(animation);
			}
		}
		
		isUiHidden = !isUiHidden;
	}
	
	if (Ti.Platform.osname == 'android') {
	
		for (var i = 0, b = images.length; i < b; i++) {
			var enlarged_image = Ti.UI.createImageView({
				image: images[i].path,
			});

			var view = Ti.UI.createView({
				backgroundColor: 'black',
				width: Ti.Platform.displayCaps.platformWidth,
				height: Ti.Platform.displayCaps.platformHeight,
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
	
					// if (e.source.firstLoad) {
						// reComputeImageSizeOnChange(e.source.index);
					// }
	
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
	
	galleryWindow.add(buttonLeft);
	galleryWindow.add(buttonRight);

	if (scrollableGalleryView.currentPage == (scrollableGalleryView.views.length - 1)) {
		buttonRight.visible = false;
	}
	if (scrollableGalleryView.currentPage == 0) {
		buttonLeft.visible = false;
	}

	scrollableGalleryView.addEventListener('scroll', function(e) {

		galleryWindow.title = e.currentPage + 1 + ' of ' + numOfImages;

		if (typeof images[e.currentPage].caption == 'undefined' || images[e.currentPage].caption == 'undefined') {
			images[e.currentPage].caption = '';
		}

		//if (descriptionLabel != null) {
			descriptionLabel.text = images[e.currentPage].caption;
		//}

		if (!isUiHidden) {
			if (e.currentPage == (scrollableGalleryView.views.length - 1)) {
				buttonRight.visible = false;
			} else {
				buttonRight.visible = true;
			}

			if (e.currentPage == 0) {
				buttonLeft.visible = false;
			} else {
				buttonLeft.visible = true;
			}
		}
	});
}

var createThumbGallery = function() {

	thumbnailScrollView = Ti.UI.createScrollView({
		top: 0,
		contentWidth: 'auto',
		contentHeight: 'auto',
		showVerticalScrollIndicator: true,
		showHorizontalScrollIndicator: false,
	});

	computeSizesforThumbGallery();
	win.add(thumbnailScrollView);
}

var addThumbsToGallery = function(imgs){
	numOfImages += imgs.length;
	
	for (var i = 0, b = imgs.length; i < b; i++) {
		images.push(imgs[i]);
		numOfImages++;
		
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
			borderWidth: '1dp'
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

		// Increments values (thumb layout)
		currentColumn++;
		xPosition += thumbSize + thumbPadding;
		imageId++;
	}
}

createThumbGallery();

win.addEventListener('blur', function() {
	Ti.Gesture.removeEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
});

win.addEventListener('focus', function() {
	Ti.Gesture.addEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
});

var load_photos = function(){
	var loader = Ti.Network.createHTTPClient({timeout: 15000});
	
	loader.open('GET','http://dev.dohanews.co/category/photos/?json=1');
	
	loader.onload = function(){
		var photos = [];
		var response = JSON.parse(this.responseText);
		alert(response.posts.length);
		if (response.posts.length == 0){
			return;
		}
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
						author :  response.posts[i].author,
						thumbPath: attachment.images.thumbnail.url,
						path: attachment.images.large.url,
					}
					
					photos.push(photo);
				}
			}
		}
		
		addThumbsToGallery(photos);
	
	}
	loader.send();
}

load_photos();