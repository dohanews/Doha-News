var fb = require('facebook');
fb.appid = "520290184684825";
fb.permissions = ['publish_stream', 'offline_access']; // Permissions your app needs
fb.forceDialogAuth = true;

Ti.App.fbLoggedIn = fb.getLoggedIn();

var mainWin = Titanium.UI.createWindow ({
   url: "wordpress.js",
});

mainWin.orientationModes = [
    Titanium.UI.PORTRAIT
];

mainWin.open();