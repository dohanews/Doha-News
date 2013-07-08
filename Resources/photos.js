Ti.include('picturegallery.js');

var win = Titanium.UI.currentWindow;
win.backgroundColor='white';

var images = [

{ path:'http://24.media.tumblr.com/0ab98ce8de9c42ee1d845788bff5eb2a/tumblr_moqqbq2UmR1qhhgvuo6_r1_1280.jpg', caption:'anas'},
{ path:'http://25.media.tumblr.com/7922bdf0d0b3a27a6c34a4d9c57abb37/tumblr_mpagwyDNmb1qhhgvuo1_1280.jpg' },
{ path:'http://25.media.tumblr.com/0cd278ad914b7ed6706d02561056bdf3/tumblr_mp7052hesi1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/ca121f15fe11b8803b746fe479323072/tumblr_mp51dqwiLt1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/e53281a19a5abd94005412da1a9dce82/tumblr_mp191gW6BR1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/13f033fbab85c286196883c4509e8ab5/tumblr_movokskOJu1qhhgvuo1_1280.jpg' }
];

var images1 = [
{ path:'http://24.media.tumblr.com/0ab98ce8de9c42ee1d845788bff5eb2a/tumblr_moqqbq2UmR1qhhgvuo6_r1_1280.jpg', caption:'anas'},
{ path:'http://25.media.tumblr.com/7922bdf0d0b3a27a6c34a4d9c57abb37/tumblr_mpagwyDNmb1qhhgvuo1_1280.jpg' },
{ path:'http://25.media.tumblr.com/0cd278ad914b7ed6706d02561056bdf3/tumblr_mp7052hesi1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/ca121f15fe11b8803b746fe479323072/tumblr_mp51dqwiLt1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/e53281a19a5abd94005412da1a9dce82/tumblr_mp191gW6BR1qhhgvuo1_1280.jpg' },
{ path:'http://24.media.tumblr.com/13f033fbab85c286196883c4509e8ab5/tumblr_movokskOJu1qhhgvuo1_1280.jpg' }
];
var pictureGallery = PictureGallery.createWindow({
  images: images,
});

var images2 = [
{ path:'http://24.media.tumblr.com/0ab98ce8de9c42ee1d845788bff5eb2a/tumblr_moqqbq2UmR1qhhgvuo6_r1_1280.jpg', caption:'anas'},
];
win.add(pictureGallery);
pictureGallery.pushImages(images1);

setTimeout(function(){pictureGallery.pushImages(images2);}, 1000);