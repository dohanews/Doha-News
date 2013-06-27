// var upload = require('/cloud');
// upload.init();
// 
// var win = Ti.UI.currentWindow;
// 
// var button = Titanium.UI.createButton({title:'Close'});
// 
// win.leftNavButton = button;
// button.addEventListener('click', function(){
	// win.close();
//});
// 
// var opengallery = Ti.UI.createOptionDialog({
    // title:'Upload Image',
    // options:['From Photo Gallery', 'Take Photo', 'Cancel'],
    // destructive:2,
    // });
// 
// var textField = Ti.UI.createTextField({
  // borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  // color: '#336699',
  // top: 50,
  // width: 250, height: 50,
  // hintText : 'Description'
// });
// 
// 
// var currentTime = new Date();
// var hours = currentTime.getHours();
// var minutes = currentTime.getMinutes();
// var seconds = currentTime.getSeconds();
// var month = currentTime.getMonth() + 1;
// var day = currentTime.getDate();
// var year = currentTime.getFullYear();
// 
// var fileName = day+"-"+month+"-"+year+" "+hours+"."+minutes+"."+seconds+".jpg"
// console.log(fileName)
// 
// 
// var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, fileName);
// 
// opengallery.addEventListener('click', function(e) {
	// if (e.index == 0) {
    	// Titanium.Media.openPhotoGallery({
    		// success:function(event)
	    // {
	    	// var image = event.media;
			// f.write(image);
// 					 
			// var imageView = Titanium.UI.createImageView({
			    // image:f.nativePath,
			    // width: 250
			// });
// 					
			// win.add(imageView);
			// win.add(textField);
	    // }
//     		
    	// });
   // }
   // else if (e.index == 1){
//    	
   	// Titanium.Media.showCamera({
		// success:function(event)
	    // {
	    	// var image = event.media;
			// var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "savedImage.jpg");
			// f.write(image);
// 					 
			// var imageView = Titanium.UI.createImageView({
			    // image:f.nativePath,
			// });
// 			
			// win.add(imageView);
			// win.add(textField);
		// },
	        // cancel:function()
	        // {
	        // },
	        // error:function(error)
	        // {
	            // var a = Titanium.UI.createAlertDialog({title:'Camera'});
// 	 
	            // if (error.code == Titanium.Media.NO_CAMERA)
	            // {
	            	// a.setMessage('Device does not have video recording capabilities');
	            // }
	            // else
	            // {
	                // a.setMessage('Unexpected error: ' + error.code);
	            // }
// 	 
	            // a.show();
	        // },
	            // saveToPhotoGallery:true,
	            // allowImageEditing:true
	// })
//    	
   // }
   // else{
   	// win.close();
   // }
// });
// 
// var longitude;
// var latitude;
//  
// Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
// Titanium.Geolocation.distanceFilter = 10;
// Titanium.Geolocation.getCurrentPosition(function(e)
// {
    // if (!e.success || e.error)
    // {
        // alert('error ' + JSON.stringify(e.error));
        // return;
    // }
    // longitude = e.coords.longitude;
    // latitude = e.coords.latitude;
    // var altitude = e.coords.altitude;
    // var heading = e.coords.heading;
    // var accuracy = e.coords.accuracy;
    // var speed = e.coords.speed;
    // var timestamp = e.coords.timestamp;
    // var altitudeAccuracy = e.coords.altitudeAccuracy;
// });
// 
// var send = Titanium.UI.createButton({title:'Send', top: 100});
// 
// 
// win.add(send);
// 
// send.addEventListener('click', function(){
	// var emailDialog = Ti.UI.createEmailDialog({
			// subject: 'Photo Submission',
			// toRecipients: ['test@email.com'],
			// messageBody: textField.value +'\n\n'+'http://maps.google.com/maps?q='+latitude + ',' + longitude
		// });
		// emailDialog.addAttachment(f);
		// emailDialog.open();
		// win.close();
// });
// 
// 
// opengallery.show();


var upload = require('/cloud');
upload.init();

var win1 = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});

win1.leftNavButton = button;
button.addEventListener('click', function(){
	win1.close();
});

var opengallery = Ti.UI.createOptionDialog({
    title:'Upload Image',
    options:['From Photo Gallery', 'Take Photo', 'Cancel'],
    destructive:2,
    });

var nameField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  bottom: 150,
  width: 250, height: 30,
  hintText : 'Name (Required)',
});

var emailField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  bottom: 110,
  width: 250, height: 30,
  hintText : 'Email (Required)',
});

var descriptionField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  bottom: 50,
  width: 250, height: 50,
  hintText : 'Description',
});


opengallery.addEventListener('click', function(e) {
	if (e.index == 0) {
		Ti.Media.openPhotoGallery({
		autoHide: true,
		mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
		success: function(e) {
			showPhoto(e);
			win1.add(nameField);
			win1.add(emailField);
			win1.add(descriptionField);
			//sendPiccyToCloud(e)
		}
		});
	}
	else if (e.index == 1){
		Ti.Media.showCamera({
		success: function(e) {showPhoto(e);
		sendPiccyToCloud(e)}
		});
	}
});

opengallery.show();

var options = Ti.UI.createView({layout: 'vertical'});
//var sendPhoto = Ti.UI.createButton({title: 'Send photo to the cloud'});
console.log(Ti.Platform.displayCaps.platformHeight)
var thePhoto = Ti.UI.createImageView({top: 10, height: 200});
//options.add(sendPhoto);
options.add(thePhoto);
win1.add(options);
win1.open();

// sendPhoto.addEventListener('click', function(e) {
// });

function showPhoto(_args) {
thePhoto.setImage(_args.media);
}

function sendPiccyToCloud(_args) {
// first we need to write out a file of the piccy
var file = Ti.Filesystem.getFile(Ti.Filesystem.
applicationDataDirectory, 'cloudThis.png');
file.write(_args.media);
console.log(file.name)
// then send this file to the Cloud
upload.sendPiccy(file.name);
file = null;
}
