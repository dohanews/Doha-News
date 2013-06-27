var feed_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: "122905538-PLT8TwjeeHbgOPiETLH2IlUriCEj2c7obgOrynmO",
  accessTokenSecret: "96qsZDsWdgTb07fgUwRnqc04p9GCkT7EynNHbg7lqM",
});

var sharing_client = Twitter({
  consumerKey: "FDgfEjNPwqLnZq7xlJuA",
  consumerSecret: "kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw",
  accessTokenKey: Ti.App.Properties.getString('twitterAccessTokenKey'),
  accessTokenSecret: Ti.App.Properties.getString('twitterAccessTokenSecret'),
});


// 
// var accessTokenKey = Ti.App.Properties.getString('twitterAccessTokenKey');
// var accessTokenSecret = Ti.App.Properties.getString('twitterAccessTokenSecret');
// 
// var currentTwitterKey
// var currentTwitterSecret
// 
// client.request("1.1/statuses/mentions_timeline.json?screen_name=dohanews", {count: 100}, 'GET', 
	    	// function(e) {
	    		// var timeline = JSON.parse(e.result.text);
	    		// for (i = 0; i < timeline.length; i++){
		    		// console.log(timeline[i]);
		    		// console.log('--------------------------------------------------------------------------------');
		    	// }
	    	// });