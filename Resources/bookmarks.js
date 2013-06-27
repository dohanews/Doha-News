
var db = require('database');
var win = Titanium.UI.currentWindow;

var b = Ti.UI.createButton({
	title:'Test',
	width: Ti.UI.SIZE,
	height: Ti.UI.SIZE,
})
win.add(b);
	b.addEventListener('click',function(){
	var results = db.getAll();
for (i = 0; i<results.length; i++)
{
	console.log(results[i].content);
}

});
win.open();

