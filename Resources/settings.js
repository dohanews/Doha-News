Ti.include('twitter.js');
Ti.include('jsOAuth-1.3.1.js');
Ti.include('twitter_clients.js');
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

var sharing_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: Ti.App.Properties.getString('twitterAccessTokenKey'),
  accessTokenSecret: Ti.App.Properties.getString('twitterAccessTokenSecret'),
});

var logout = Titanium.UI.createButton({title:'Log out'});

logout.addEventListener('click', function(){
	var client = Titanium.Network.createHTTPClient();
	client.clearCookies('https://www.twitter.com');
	Ti.App.Properties.setString('twitterAccessTokenKey', null);
	Ti.App.Properties.setString('twitterAccessTokenSecret', null);
	console.log('logged out');
});



var twitterLogin = Titanium.UI.createButton({title:'Twitter Login', top:100});
twitterLogin.addEventListener('click', function(e) {
	if (!Ti.App.Properties.getString('twitterAccessTokenKey')){
		var sharing_client = Twitter({
		  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
		  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
		  accessTokenKey: null,
		  accessTokenSecret: null,
		});
		
		sharing_client.addEventListener('login', function(e) {
			if (e.success) {
			    Ti.App.Properties.setString('twitterAccessTokenKey', e.accessTokenKey);
				Ti.App.Properties.setString('twitterAccessTokenSecret', e.accessTokenSecret);
				console.log('logged in!');
				console.log(Ti.App.Properties.getString('twitterAccessTokenKey'));
				console.log(Ti.App.Properties.getString('twitterAccessTokenSecret'));
		    } 
		    else {
		    	alert(e.error);
		    }
		});
		sharing_client.authorize();
	}
	else{
		console.log('already logged in!');
		console.log(Ti.App.Properties.getString('twitterAccessTokenKey'));
		console.log(Ti.App.Properties.getString('twitterAccessTokenSecret'));
	}
	// feed_client.request("1.1/statuses/mentions_timeline.json?screen_name=dohanews", {count: 100}, 'GET', 
	    	// function(e) {
	    		// var timeline = JSON.parse(e.result.text);
	    		// alert(1);
	    		// alert(timeline);
	    		// alert(e.error);
	    		// for (i = 0; i < timeline.length; i++){
// 	    			
		    		// console.log(timeline[i]);
		    		// console.log('--------------------------------------------------------------------------------');
		    	// }
	    	// });
	//sharing_client.authorize();

	
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