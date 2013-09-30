var upload = require('/cloud');
upload.init();
var Cloud = require('ti.cloud');
Ti.include('and-common.js');

var win = Ti.UI.currentWindow;
win.layout = 'vertical';

if (Ti.Platform.osname != 'android')
{
	var common = require('ios-common');
	var header = common.create_header(true, true);
	header.addEventListener('click', function(){win.close();});
	win.add(header);
}


	// var actionBar = win.getActivity().actionBar;
				// if (actionBar){
					// actionBar.icon = "images/header-logo.png";
					// actionBar.title = "";
					// actionBar.displayHomeAsUp = true;
					// actionBar.onHomeIconItemSelected = function() {
						// win.close();
					// };
				// }
win.backgroundColor = 'white';

var emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
var height;
var width;

if (Ti.Gesture.landscape){
	width = Ti.Platform.displayCaps.platformHeight - 20;
	height = Ti.Platform.displayCaps.platformWidth - 100;
}
else{
	height = Ti.Platform.displayCaps.platformHeight - 100;
	width = Ti.Platform.displayCaps.platformWidth - 20;
}

var photo;
var location;

var scrollView = Titanium.UI.createScrollView({
	top: '5dp',
});

var view = Ti.UI.createView();

var fields = Ti.UI.createView({
	layout: 'vertical',
	left: 10,
	right: 10,
	top: 20 + ((2/3) *width),
});

scrollView.add(view);
// var header = create_header();
// win.add(header);

var longitude;
var latitude;
 
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

Titanium.Geolocation.getCurrentPosition(function(e){
    if (!e.success || e.error){
        alert('error ' + JSON.stringify(e.error));
        return;
    }
    
    longitude = e.coords.longitude;
    latitude = e.coords.latitude;
    var altitude = e.coords.altitude;
    var heading = e.coords.heading;
    var accuracy = e.coords.accuracy;
    var speed = e.coords.speed;
    var timestamp = e.coords.timestamp;
    var altitudeAccuracy = e.coords.altitudeAccuracy;
});

if (latitude == null){
	location = 'No Location Available';
}
else{
	location = 'http://maps.google.com/maps?q='+latitude + ',' + longitude;
}

var show_preview = function (_args) {
	
	var imagePreview = Ti.UI.createImageView({
		image: _args.media,
		borderWidth: '1px',
		borderColor: 'darkgray',
	});
	
	if (attachButton.children[0])
		attachButton.remove(attachButton.children[0]);
	
	attachButton.backgroundImage = null;
	attachButton.add(imagePreview);
	descriptionField.hintText = 'Caption';
};

var clear_fields = function(){

	nameField.value = '';
	emailField.value = '';
	descriptionField.hintText = 'Description';
	descriptionField.value = '';
	photo = null;
	
	attachButton.backgroundImage = Ti.Gesture.landscape? 'images/submit_camera_icon_square.png' : 'images/submit_camera_icon.png';
	
	if (attachButton.children[0])
		attachButton.remove(attachButton.children[0]);
};

// var button = Titanium.UI.createButton({title:'Close'});
// 
// win.leftNavButton = button;
// 
// button.addEventListener('click', function(){
	// win.close();
// });

var create_gallery_menu = function(){
	var optionsArray;
	
	if (photo != null)
		optionsArray = ['From Photo Gallery', 'Take Photo', 'Remove Photo', 'Cancel'];
	else
		optionsArray = ['From Photo Gallery', 'Take Photo', 'Cancel'];
		
	var options = Ti.UI.createOptionDialog({
		title: 'Upload Image',
		options: optionsArray,
		destructive: 2,
	});
	
	options.addEventListener('click', function(e) {
		if (e.index == 0) {
			Ti.Media.openPhotoGallery({
				autoHide: true,
				mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
				success: function(e) {
					var blob;
					photo = null;	
					
					photo = e;
					try{
						blob = {media: photo.media.imageAsThumbnail((2/3)*width)};
					}
					catch(e){
						blob = {media: 'images/preview_not_available.png' };
					};
					show_preview(blob);
					blob = null;
				}
			});
 			
			// var intent = Ti.Android.createIntent({
			    // action: Ti.Android.ACTION_PICK,
			    // type: "image/*"
			// });
// 		
			// Ti.Android.currentActivity.startActivityForResult(intent, function(e){
				// if (e.error) {
					// Ti.UI.createNotification({ message: 'Error: ' + e.error }).show();
				// }
				// else{
			        // if (e.resultCode === Titanium.Android.RESULT_OK) {
// 			             
			            // // get file path from gallery as a file
			            // var tmpfile = Ti.Filesystem.getFile(e.intent.data);
// 			 
			            // // create a new temp file
			            // var tmpfile2 = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "temp.jpg");
// 			                 
			            // // copy the unaccesable file from gallery to the temp file
			            // tmpfile.copy(tmpfile2.nativePath);
// 			             
			            // // send to the handler
			            // show_preview(tmpfile2.read());
// 			             
			            // tmpfile2.deleteFile();
// 			             
			        // }else {
			            // Ti.UI.createNotification({ message: 'Canceled/Error? Result code: ' + e.resultCode }).show();
			        // }
			    // }  
			// });
		}
		else if (e.index == 1){
			Ti.Media.showCamera({
				success: function(e) {
					var blob;
					photo = null;	
					photo = e;
					
					try{
						blob = {media: photo.media.imageAsThumbnail((2/3)*width)};
					}
					catch(e){
						blob = {media: 'images/preview_not_available.png' };
					};
					show_preview(blob);
					blob = null;
				}
			});
		}
		else if (e.index == 2){
			photo = null;
			if(attachButton.children[0]){
				attachButton.remove(attachButton.children[0]);
				attachButton.backgroundImage = Ti.Gesture.landscape? 'images/submit_camera_icon_square.png' : 'images/submit_camera_icon.png';
			}
			descriptionField.hintText = 'Description';
		}
	});
	
	return options;
};

var create_indicator_view = function(){
	var actInd = Ti.UI.createActivityIndicator({
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		style: Ti.UI.ActivityIndicatorStyle.BIG_DARK,
	});
	
	var view = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		backgroundColor: 'black',
		opacity: 0.7,
		actInd: actInd,
	});
	
	view.add(view.actInd);
	actInd.show();
	return view;
};

var confirmation_label = Titanium.UI.createLabel({
		text: 'Thank You!',
		color: 'white',
		font:{
			fontSize: '20dp',
			fontFamily: 'droidsans',
			}
});


var attachButton = Titanium.UI.createView({
	backgroundImage: Ti.Gesture.landscape? 'images/submit_camera_icon_square.png' : 'images/submit_camera_icon.png',
	width: width,
	top: '10dp',
	height: (2/3) *width,
});

attachButton.addEventListener('click', function(){
	create_gallery_menu().show();
});

var nameField = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
	width: Ti.UI.FILL,
	height: height*0.08,
	top: '3dp',
	hintText : 'Name (Required)',
});

var first = true;

nameField.addEventListener('focus', function f(e){
    if(first){
		first = false;
		nameField.blur();
    }
    else{
        nameField.removeEventListener('focus', f);
    }
});

var emailField = Ti.UI.createTextField({
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
	width: Ti.UI.FILL,
	height: height*0.08,
	top: '3dp',
	hintText : 'Email (Required)',
});

var descriptionField = Ti.UI.createTextField({
	verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	width: Ti.UI.FILL,
	height: height*0.25,
	top: '3dp',
	hintText : 'Description',
});

//Begin with active image
var geoSwitch = Ti.UI.createImageView({
	image: 'images/location_active.png',
	value: true,
	height: Ti.Platform.osname == 'android'? height*0.08 : '25dp',
	left: 0
});

geoSwitch.addEventListener('click', function(){
	//Change the latter image to active
	geoSwitch.image = geoSwitch.value? 'images/location_inactive.png':'images/location_active.png';
	geoSwitch.value = !geoSwitch.value;
});

var sendButton = Ti.UI.createButton({title:'Send',
	height: height*0.10, 
	width: width*0.25,
	right: 0,
});

sendButton.addEventListener('click', function(){
	if (descriptionField.value == "" && photo == null)
	{
		alert('Please attach photo or add description');
	}
	else if (nameField.value=="" || emailField.value=="")
	{
		alert('Name and Email are required');
	}
	else if (emailRegex.test(emailField.value) == false)
	{
		alert('Please enter a valid email address');
	}
	else {
		if (photo == null)
		{
			var actIndView = create_indicator_view();
			win.add(actIndView);
			
			if (geoSwitch.value == false){
				latitude = null;
				longitude = null;
			}
			Cloud.Posts.create({
			    content: descriptionField.value,
			    custom_fields: {Name: nameField.value, Email: emailField.value, Location: location}
			}, function (e) {
			    if (e.success) {
					var post = e.posts[0];
					actIndView.actInd.hide();
					actIndView.add(confirmation_label);
					setTimeout(function(){win.remove(actIndView);clear_fields();}, 2000);
					
			    } else {
					alert('Sorry! Couldn\'t upload your photo. Please try again later.');
					clear_fields();
					win.remove(actIndView);
			    }
			});
		}
		else
		{		
			sendPiccyToCloud(photo);
		}
	}
});

function sendPiccyToCloud(_args) {
	var actIndView = create_indicator_view();
	win.add(actIndView);
	
	var currentTime = new Date();

	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	
	var file = Ti.Filesystem.getFile(Ti.Filesystem.
	applicationDataDirectory, day+"-"+month+"-"+year+".png");
	file.write(_args.media);
	
	if (geoSwitch.value == false){
		latitude = null;
		longitude = null;
	}

	var success = upload.sendPiccy(file.name, nameField.value, emailField.value, descriptionField.value, location);
	actIndView.actInd.hide();
	actIndView.add(confirmation_label);
	setTimeout(function(){win.remove(actIndView);clear_fields();}, 2000);
}

view.add(attachButton);
fields.add(nameField);
fields.add(emailField);
fields.add(descriptionField);

var sendGeoView = Ti.UI.createView({
	height: Ti.UI.SIZE,
});

sendGeoView.add(sendButton);
sendGeoView.add(geoSwitch);

fields.add(sendGeoView);
view.add(fields);

var render_on_rotation = function(e){
	if (Ti.Gesture.landscape){
		var topMargin = 45 * (Ti.Platform.displayCaps.dpi/160);
		var buttonHeight = Ti.Platform.displayCaps.platformHeight - 40 - topMargin;
		
		attachButton.backgroundImage = 'images/submit_camera_icon_square.png';
		attachButton.center = null;
		attachButton.height = buttonHeight;
		attachButton.width = buttonHeight;
		attachButton.right = 10;
		fields.top = '10dp',
		fields.left = 10;
		fields.right = buttonHeight + 20;
	}
	else if (Ti.Gesture.portrait){
		attachButton.backgroundImage = 'images/submit_camera_icon.png';
		attachButton.height = (2/3)*width;
		attachButton.width = width;
		attachButton.center = {x: Ti.Platform.displayCaps.platformWidth/2};
		fields.top = 20 + ((2/3) *width);
		fields.left = 10;
		fields.right = 10;
	}
};

win.add(scrollView);
render_on_rotation();

Ti.Gesture.addEventListener('orientationchange', render_on_rotation);