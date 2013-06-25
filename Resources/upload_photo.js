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
  top: 10,
  width: 250, height: 50,
  hintText : 'Description'
});

var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "savedImage.jpg");

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

var send = Titanium.UI.createButton({title:'Send'});

win.rightNavButton = send;
send.addEventListener('click', function(){
	var emailDialog = Ti.UI.createEmailDialog({
			subject: 'Photo Submission',
			toRecipients: ['test@email.com'],
			messageBody: textField.value
		});
		emailDialog.addAttachment(f);
		emailDialog.open();
});

opengallery.show();