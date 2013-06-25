var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});

win.leftNavButton = button;
button.addEventListener('click', function(){
	win.close();
});

var opengallery = Ti.UI.createOptionDialog({
    title:'Upload Image',
    options:['From Photo Gallery', 'Take Photo', 'Cancel'],
    destructive:2,
    });

var textField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 50,
  width: 250, height: 50,
  hintText : 'Description'
});


var currentTime = new Date();
var hours = currentTime.getHours();
var minutes = currentTime.getMinutes();
var seconds = currentTime.getSeconds();
var month = currentTime.getMonth() + 1;
var day = currentTime.getDate();
var year = currentTime.getFullYear();

var fileName = day+"-"+month+"-"+year+" "+hours+"."+minutes+"."+seconds+".jpg"
console.log(fileName)


var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, fileName);

opengallery.addEventListener('click', function(e) {
	if (e.index == 0) {
    	Titanium.Media.openPhotoGallery({
    		success:function(event)
	    {
	    	var image = event.media;
			f.write(image);
					 
			var imageView = Titanium.UI.createImageView({
			    image:f.nativePath,
			    width: 250
			});
					
			win.add(imageView);
			win.add(textField);
	    }
    		
    	});
   }
   else if (e.index == 1){
   	
   	Titanium.Media.showCamera({
		success:function(event)
	    {
	    	var image = event.media;
			var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "savedImage.jpg");
			f.write(image);
					 
			var imageView = Titanium.UI.createImageView({
			    image:f.nativePath,
			});
			
			win.add(imageView);
			win.add(textField);
		},
	        cancel:function()
	        {
	        },
	        error:function(error)
	        {
	            var a = Titanium.UI.createAlertDialog({title:'Camera'});
	 
	            if (error.code == Titanium.Media.NO_CAMERA)
	            {
	            	a.setMessage('Device does not have video recording capabilities');
	            }
	            else
	            {
	                a.setMessage('Unexpected error: ' + error.code);
	            }
	 
	            a.show();
	        },
	            saveToPhotoGallery:true,
	            allowImageEditing:true
	})
   	
   }
   else{
   	win.close();
   }
});

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

var send = Titanium.UI.createButton({title:'Send', top: 100});

//win.rightNavButton = send;

win.add(send);

send.addEventListener('click', function(){
	var emailDialog = Ti.UI.createEmailDialog({
			subject: 'Photo Submission',
			toRecipients: ['test@email.com'],
			messageBody: textField.value +'\n\n'+'http://maps.google.com/maps?q='+latitude + ',' + longitude
		});
		emailDialog.addAttachment(f);
		emailDialog.open();
		win.close();
});

console.log(latitude + ',' + longitude);

opengallery.show();