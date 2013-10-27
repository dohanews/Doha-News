var Cloud = require('ti.cloud');

var win1 = Ti.UI.currentWindow;
var height = Ti.Platform.displayCaps.platformHeight - 100;


//login as the cloud user....
function init(_args) {
	if (!Cloud.sessionId) {
		Cloud.Users.login({
		login: 'doha1',
		password: 'dohanews'
	}, function (e) {
		if (e.success) {
			// _args.success({user : e.users[0]});
		} else {
			//_args.error({error: e.error});
		}
	});
	}
};
exports.init = init;

function sendPiccy(_args, name, email, description, location) {
	// create a new photo
	Cloud.Photos.create({
		photo: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory+'/'+_args),
		custom_fields: {Name: name, Email: email, Caption: description, Location: location}
		}, function (e) {
			if (e.success) {
				Cloud.onsendstream = function (e) {
    			Ti.API.info('Please Wait, Uploading Photo '+(Math.floor(e.progress * 0.5*100)*2)+'% Complete');
				};
				var photo = e.photos[0];
				return true;
			} else {
				alert('Sorry! Couldn\'t upload your photo. Please try again later.');
				return false;
			}
		});
}
exports.sendPiccy = sendPiccy;