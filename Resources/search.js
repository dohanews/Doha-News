var searchParent = Ti.UI.createView({
	backgroundColor: 'transparent',
	height: Ti.UI.FILL,
});

var searchButton = Ti.UI.createButton({
	title:'Search',
	width: '200px',
	right:0,
});

var field = Ti.UI.createTextField({
	backgroundColor: 'gray',
	opacity: 0.4,
	hintText: 'field',
	left: '420px',
	width: '200px',
	enableReturnKey: true,
	returnKeyType: Ti.UI.RETURNKEY_SEARCH,
	horizontalWrap: false,
});

var xButton = Ti.UI.createImageView({
	image: 'images/search.png',
	width: '50px',
	height: '50px',
	left: '630px',
	zIndex: 2,
	bubbleParent: false,
	right: 0,
});

xButton.addEventListener('singletap', function(e){
	field.value = '';
	searchParent.hide();
	field.blur();
	if (Ti.Platform.osname === 'android'){
		Ti.UI.Android.hideSoftKeyboard();
	}
	searchButton.show();
});

var getSearchResults = function(e){
	var query = field.value.replace(' ','+');
	
	var loader = Titanium.Network.createHTTPClient();
	loader.open("GET",'http://dev.dohanews.co/?json=1&count=10&s='+query);
	loader.onload = function(){
		var results = JSON.parse(this.responseText);
		alert(results.count_total);
	};
	field.blur();
	if (Ti.Platform.osname === 'android'){
		Ti.UI.Android.hideSoftKeyboard();
	}
	
	loader.send();
};
field.addEventListener('return', getSearchResults);
   
searchButton.addEventListener('click',function(e){
	searchButton.hide();
	searchParent.show();
});

searchParent.add(field);
searchParent.add(xButton);
searchParent.hide();

