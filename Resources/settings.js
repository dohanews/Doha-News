Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');

var win = Ti.UI.currentWindow;

var button = Titanium.UI.createButton({title:'Close'});

win.leftNavButton = button;
button.addEventListener('click', function(){
	win.close();
});


var fb = require('facebook');
fb.appid = "520290184684825";
fb.permissions = ['publish_stream', 'offline_access']; // Permissions your app needs
fb.forceDialogAuth = true;

fb.addEventListener('login', function(e) {
	if (e.success) {
		console.log(fb.accessToken);
		Ti.App.fbLoggedIn = true;
	} else if (e.error) {
	    alert(e.error);
	} else if (e.cancelled) {
	    alert("Cancelled");
	}
});

fb.addEventListener('logout', function(e) {
	alert('Logged out');
	var client = Titanium.Network.createHTTPClient();
	client.clearCookies('https://login.facebook.com');
	Ti.App.fbLoggedIn = false;
});


var facebookLogin = fb.createLoginButton({
	top: 10,
});

facebookLogin.addEventListener('click', function(e) {
	if(!Ti.App.fbLoggedIn){	
		fb.authorize();
	}
});

var logout = Titanium.UI.createButton({title:'Log out'});

logout.addEventListener('click', function(){
	if(Ti.App.fbLoggedIn)	
		fb.logout();
});


var client = Twitter({
  consumerKey: "dA16PByC2iPsc30GgFh1ng",
  consumerSecret: "XQcDIrp5wBte8esPbCvJhX830vf3ut4NV4ucwgSRs"
});

var accessTokenKey = Ti.App.Properties.getString('twitterAccessTokenKey')
var accessTokenSecret = Ti.App.Properties.getString('twitterAccessTokenSecret')

var currentTwitterKey
var currentTwitterSecret

var twitterLogin = Titanium.UI.createButton({title:'Twitter Login', top:100});
twitterLogin.addEventListener('click', function(e) {
	client.authorize();
	client.addEventListener('login', function(e) {
	  if (e.success) {
	    // Your app code goes here... you'll likely want to save the access tokens passed in the event.
	    currentTwitterKey = e.accessTokenKey,
	    currentTwitterSecret = e.accessTokenSecret,
	    console.log(currentTwitterKey),
	    console.log(currentTwitterSecret);	    
	  } 
	  else {
	    alert(e.error);
	  }
	});
})

var ifbutton = Titanium.UI.createButton({title:'Am I logged in?', top:400});
	ifbutton.addEventListener('click', function()
        {
        	console.log(fb.loggedIn);
        	console.log(fb.expirationDate);
});
win.add(ifbutton);
win.add(logout);
win.add(facebookLogin);
win.add(twitterLogin);	