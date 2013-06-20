// You need to have already logged the user in and obtained the access_token

// To get an access_token which never expires, you need to ask for the 'offline_access' permission too.

// May 2011 : @Kosso

	
// function postToFacebook(fb_access_token,title,link_url,caption,description){
// 
	// if(Titanium.Facebook.loggedIn===false && Ti.Facebook.uid===null){
		// alert('You are logged in to Facebook to send the post.');
		// return;
	// }
// 	
	// var xhr = Titanium.Network.createHTTPClient();
	// xhr.timeout = 1000000;
	// xhr.onerror = function(e){
		// //Ti.API.info('IN ERROR ' + e.error);
	// };
	// xhr.onload = function(){	
		// Ti.API.info(this.responseText);		
		// // check for a reply.id here....			
		// var reply = JSON.parse(this.responseText);
		// if(reply.id){
			// //Ti.UI.createAlertDialog({title:'Facebook', message:'Your link to Facebook was posted'}).show();
		// } else {
			// Ti.UI.createAlertDialog({title:'Facebook Error', message:'Your link was not posted for some reason!'}).show();
		// }
	// };
// 
	// var endPoint = 'https://graph.facebook.com/me/feed';
	// xhr.open('POST',endPoint);
	// xhr.send({
		// access_token:fb_access_token,
		// link:link_url,
		// //picture:image_url,
		// name:title,
		// caption:caption,
		// description:description
	// });
	// xhr.onreadystatechange = function(){
		// alert('changed');
		// console.log('mine ' + this.responseText);
	// };
// 
// }

