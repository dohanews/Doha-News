var Cloud = require('ti.cloud');

var win1 = Ti.UI.currentWindow;



//login as the cloud user....
function init(_args) {
if (!Cloud.sessionId) {
Cloud.Users.login({
login: 'doha',
password: 'dohanews'
}, function (e) {
if (e.success) {
// _args.success({user : e.users[0]});
} else {
_args.error({error: e.error});
}
});
}
};
exports.init = init;

function sendPiccy(_args) {
// create a new photo
Cloud.Photos.create({
photo: Ti.Filesystem.getFile(Ti.Filesystem.
applicationDataDirectory+'/'+_args),
custom_fields: {Name: 'Ali Naqi'}
}, function (e) {
if (e.success) {
var photo = e.photos[0];
alert('Success:\n' +'id: ' + photo.id );
} else {
alert('Error:\\n' +
((e.error && e.message) || JSON.stringify(e)));
}
});
}
exports.sendPiccy = sendPiccy;