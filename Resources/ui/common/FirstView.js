//FirstView Component Constructor
function FirstView() {
	//create object instance, a parasitic subclass of Observable
	var self = Ti.UI.createView();
	
	var _logoMarginLeft = (300 - 253) / 2;

	
	var logo = Titanium.UI.createImageView({
	  image: '/images/Doha-News-Logo-Rect-450.png',
	  width: 253,
	  height: 60,
	  top: 0 
	});
	
	self.add(logo);
	
	return self;
}

module.exports = FirstView;
