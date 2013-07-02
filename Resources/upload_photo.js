var upload = require('/cloud');
upload.init();
var Cloud = require('ti.cloud');

var win = Ti.UI.currentWindow;
var scrollView = Titanium.UI.createScrollView();
var height = Ti.Platform.displayCaps.platformHeight - 100
var width = Ti.Platform.displayCaps.platformWidth - 20
var view = Ti.UI.createView(); 
scrollView.add(view);
win.add(scrollView);

var longitude;
var latitude;
 
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;
Titanium.Geolocation.getCurrentPosition(function(e)
{
    if (!e.success || e.error)
    {
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

var location

if (latitude == null){
	location = 'No Location Available'
}
else{
	location = 'http://maps.google.com/maps?q='+latitude + ',' + longitude	
}

var actInd = Ti.UI.createActivityIndicator({
	width:50,
	height:50,
	message: 'uploading...',
	color: 'FF0000',
	top: height*0.95
})


var label = Ti.UI.createLabel({
  text: 'Location: ',
  left: 10,
  top: height*0.85, height: height*0.08
});

view.add(label)

var geoSwitch = Ti.UI.createSwitch({
  value:true,
  top: height*0.95, left: 9, height: height*0.08
});

view.add(geoSwitch);

geoSwitch.addEventListener('change',function(e){
  Ti.API.info('Switch value: ' + geoSwitch.value);
});

var button = Titanium.UI.createButton({title:'Close'});

win.leftNavButton = button;
button.addEventListener('click', function(){
	win.close();
});

var attachButton = Titanium.UI.createButton({title: 'Attach Photo', top: 5});
attachButton.addEventListener('click', function(){
	opengallery.show();
	
});

var opengallery = Ti.UI.createOptionDialog({
    title:'Upload Image',
    options:['From Photo Gallery', 'Take Photo', 'Cancel'],
    destructive:2,
    });

var nameField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  top: height*0.40,
  width: width, height: height*0.08,
  hintText : 'Name (Required)',
});

var first = true;
nameField.addEventListener('focus', function f(e){
    if(first){
        first = false;
        nameField.blur();
    }else{
        nameField.removeEventListener('focus', f);
    }
});

var emailField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  top: height*0.50,
  width: width, height: height*0.08,
  hintText : 'Email (Required)',
});

var descriptionField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  top: height*0.60,
  width: width, height: height*0.25,
  hintText : 'Description',
});

var temp;

opengallery.addEventListener('click', function(e) {
	if (e.index == 0) {
		Ti.Media.openPhotoGallery({
		autoHide: true,
		mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
		success: function(e) {
			showPhoto(e);
			temp = e;
			//sendPiccyToCloud(e)
		}
		});
	}
	else if (e.index == 1){
		Ti.Media.showCamera({
		success: function(e) {showPhoto(e);
		//sendPiccyToCloud(e)
		temp = e;
		}
		});
	}
});

//opengallery.show();

var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

var sendButton = Ti.UI.createButton({title:'Send', top: height*0.90, height: height*0.10, width: width*0.25, right: 10});
sendButton.addEventListener('click', function(){
	if (descriptionField.value=="" && temp==null)
	{
		alert('Please attach photo or add description');
	}
	else if (nameField.value=="" || emailField.value=="")
	{
		alert('Name and Email are required');
	}
	else if (reg.test(emailField.value) == false)
	{
		alert('Please enter a valid email address')
	}
	else {
		if (temp == null)
		{
				if (geoSwitch.value == false){
					latitude = null;
					longitude = null;
				}
				Cloud.Posts.create({
				    content: descriptionField.value,
				    custom_fields: {Name: nameField.value, Email: emailField.value, Location: location}
				}, function (e) {
				    if (e.success) {
				    	view.add(actInd);
						actInd.show();
				        var post = e.posts[0];
				        alert('Description Submitted');
				        win.close();
				    } else {
				        alert('Error:\\n' +
				            ((e.error && e.message) || JSON.stringify(e)));
				    }
				});
		}
		else
		{		
			sendPiccyToCloud(temp)
		}
	}
});

var options = Ti.UI.createView({layout: 'vertical'});
var thePhoto = Ti.UI.createImageView({top: (height*0.10)+5, height: height*0.25});
options.add(thePhoto);
view.add(options);


function showPhoto(_args) {
thePhoto.setImage(_args.media);

if (descriptionField.value=='')
{
		descriptionField = Ti.UI.createTextField({
		  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		  top: height*0.60,
  		  width: width, height: height*0.25,
		  hintText : 'Caption',
		});
		
		view.add(descriptionField)
}
}

var currentTime = new Date();

var month = currentTime.getMonth() + 1;
var day = currentTime.getDate();
var year = currentTime.getFullYear();

function sendPiccyToCloud(_args) {
// first we need to write out a file of the piccy
var file = Ti.Filesystem.getFile(Ti.Filesystem.
applicationDataDirectory, day+"-"+month+"-"+year+".png");
file.write(_args.media);
//console.log(file.name)
// then send this file to the Cloud

if (geoSwitch.value == false){
	latitude = null;
	longitude = null;
}

upload.sendPiccy(file.name, nameField.value, emailField.value, descriptionField.value, location);
view.add(actInd);
actInd.show();
}




view.add(attachButton);
view.add(nameField);
view.add(emailField);
view.add(descriptionField);
view.add(sendButton);

Ti.API.info('Switch value: ' + geoSwitch.value);