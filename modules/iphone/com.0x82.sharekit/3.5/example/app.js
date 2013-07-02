// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white',
  orientationModes: [
    Titanium.UI.LANDSCAPE_LEFT,
    Ti.UI.LANDSCAPE_RIGHT,
    Ti.UI.UPSIDE_PORTRAIT,
    Ti.UI.PORTRAIT
  ]
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

var sharekit = require('com.0x82.sharekit');
Ti.API.info("module is => " + sharekit);

// See documentation/configuration.html for reference!
// The values shown here DO NOT WORK. Please change them before testing!
sharekit.configure({
  // Required: set your app name and url
  my_app_name: 'sharekit',
  my_app_url: 'http://example.com',

  // OPTIONAL: Setting this to true will show the list in Alphabetical Order, setting to false will follow the implicit order
  share_menu_alphabetical_order: true,
  // OPTIONAL: set to true to hide the "More" button on the Share actionsheet
  // hide_more_button: true,
  // OPTIONAL: Append 'Shared With ' signature to email (and related forms)
  shared_with_signature: false,

  // See documentation/configuration.html to configure the twitter module
  twitter_consumer_key: 'FDgfEjNPwqLnZq7xlJuA',
  twitter_consumer_secret: 'kZUixuFO4qgULmSPV3KofxAf8htLGFcBcUy4MS6rLw',
  twitter_callback_url: 'http://dev.dohanews.co',
  // twitter_use_xauth: true
  // twitter_username: 'rubenfonseca'

  // For shortening URLs on Twitter
  // See the documentation/configuration.html
//   bit_ly_login: 'rubenfonseca',
//   bit_ly_key: 'R_09b5fe9a6b6b52c46a4b81243607b1a8',

  // See documentation/configuration.html
  facebook_key: '520290184684825',
  // facebook_local_key: 'lite',

 
  // Optional. See: http://developer.apple.com/iphone/library/documentation/UIKit/Reference/UIKitDataTypesReference/Reference/reference.html#//apple_ref/c/econst/UIBarStyleDefault
  bar_style: "UIBarStyleDefault",

  // Optional. Value between 0-255, set all to -1 to default
  form_font_color_red: -1,
  form_font_color_green: -1,
  form_font_color_blue: -1,
  form_bg_color_red: -1,
  form_bg_color_green: -1,
  form_bg_color_blue: -1,

  // Optional. See: http://developer.apple.com/iphone/library/documentation/UIKit/Reference/UIViewController_Class/Reference/Reference.html#//apple_ref/occ/instp/UIViewController/modalPresentationStyle
  ipad_modal_presentation_style: "UIModalPresentationFormSheet",
  // Optional. See: http://developer.apple.com/iphone/library/documentation/UIKit/Reference/UIViewController_Class/Reference/Reference.html#//apple_ref/occ/instp/UIViewController/modalTransitionStyle
  ipad_modal_transition_style: "UIModalTransitionStyleCoverVertical",

  use_placeholders: true,

  max_fav_count: 3,
  allow_offline: true,
  allow_auto_share: true
});

var button1 = Ti.UI.createButton({
  title: 'Share this link',
  top: 20,
  width: 300,
  height: 40
});
window.add(button1);

var button2 = Ti.UI.createButton({
  title: 'Logoff from all',
  top: 80,
  width: 300,
  height: 40
});
window.add(button2);

var button3 = Ti.UI.createButton({
  title: 'Share an image',
  top: 140,
  width: 300,
  height: 40
});
window.add(button3);

var button4 = Ti.UI.createButton({
  title: 'Share text',
  top: 200,
  width: 300,
  height: 40
});
window.add(button4);

var button5 = Ti.UI.createButton({
  title: 'Share file',
  top: 260,
  width: 300,
  height: 40
});
window.add(button5);

var button6 = Ti.UI.createButton({
  title: 'Share on Facebook',
  top: 320,
  width: 300,
  height: 40
});
window.add(button6);

button1.addEventListener('click', function(e) {
  sharekit.share({
    title: "Testing 1 2 3",
    view: button1,
    link: 'http://google.com'
  });
});

button3.addEventListener('click', function(e) {
  var image = window.toImage();
  sharekit.share({
    title: "Image test",
    view: button3,
    image: image
  })
});

button4.addEventListener('click', function(e) {
  sharekit.share({
    title: "Test test",
    view: button4,
    text: "Lorem ipsum dolorem"
  });
});

button5.addEventListener('click', function(e) {
  var image = window.toImage();
  sharekit.share({
    title: "File test",
    view: button5,
    file: image,
    mimetype: 'image/jpeg'
  });
});

button6.addEventListener('click', function(e) {
  sharekit.share({
    title: "Testing stuff",
    text: 'asdfasdfasdfasdfasdf http://www.google.com',
    sharer: 'Mail'
  });
});

button2.addEventListener('click', function(e) {
  sharekit.logoutFromAll();
});

