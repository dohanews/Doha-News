var DATABASE_NAME = 'bookmarks';

exports.createTable = function(){
	Ti.App.bookmarksChanged = true;
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('CREATE TABLE IF NOT EXISTS bookmarks \
        (id INTEGER PRIMARY KEY, title TEXT, content TEXT, url TEXT, author TEXT, date TEXT, thumbnail TEXT)');
    db.close();
    
};

exports.exists = function(id) {
	var db = Ti.Database.open('bookmarks'); 
	var resultSet = db.execute('SELECT * FROM bookmarks WHERE id=(?)', id);
	var exists = false;
	
	if (resultSet.isValidRow())
		exists = true;

	resultSet.close();
	db.close();
	return exists;	
};

exports.get = function(id) {
	var db = Ti.Database.open('bookmarks'); 
	var resultSet = db.execute('SELECT * FROM bookmarks WHERE id=(?)', id);
	var result = {};
	if (resultSet.isValidRow()){
			result.id =  resultSet.fieldByName('id');
			result.title = resultSet.fieldByName('title');
			result.content = resultSet.fieldByName('content');
			result.url = resultSet.fieldByName('url');
			result.author = resultSet.fieldByName('author');
			result.date = resultSet.fieldByName('date');
			result.thumbnail = resultSet.fieldByName('thumbnail');
	}
	
	resultSet.close();
	db.close();
	return result;	
};

exports.getAll = function() {
	var db = Ti.Database.open('bookmarks'); 
	var results = [];
	var resultSet = db.execute('SELECT * FROM bookmarks');
	while (resultSet.isValidRow()) {
		console.log('Fetching...');
		results.push({
			id: resultSet.fieldByName('id'),
			title: resultSet.fieldByName('title'),
			content: resultSet.fieldByName('content'),
			url: resultSet.fieldByName('url'),
			author: resultSet.fieldByName('author'),
			date: resultSet.fieldByName('date'),
			thumbnail: resultSet.fieldByName('thumbnail'),
		});
		resultSet.next();
	}
	resultSet.close();
	db.close();
	return results;
};

exports.dropTable = function(){
	Ti.App.bookmarksChanged = true;
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DROP TABLE bookmarks');
    db.close();
};      

exports.deleteAll = function(){
	Ti.App.bookmarksChanged = true;
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DELETE FROM bookmarks');
    db.close();
};

exports.deleteId = function(id){
	Ti.App.bookmarksChanged = true;
	var db = Ti.Database.open(DATABASE_NAME);
	
	var resultSet = db.execute('SELECT thumbnail FROM bookmarks where id=?',id);
	var thumbnail;
	while (resultSet.isValidRow()) {
		thumbnail = resultSet.fieldByName('thumbnail');
		resultSet.next();
	}
	resultSet.close();
	
	if (thumbnail){
		var path = thumbnail.split(Titanium.Filesystem.separator);
		var filename = path[path.length - 1];
		var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);
		if (file.exists()){
			file.deleteFile();
		}
	}
	
    db.execute('DELETE FROM bookmarks WHERE id=(?)', id);
    db.close();
	
};

exports.remove = function(id){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute("DELETE FROM bookmarks WHERE id = ?", id);
    var rowsAffected = db.rowsAffected;
    db.close();
    Ti.App.bookmarksChanged = true;
    return rowsAffected;
};

exports.insert = function(id, title, content, url, author, date){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('INSERT INTO bookmarks (id, title, content, url, author, date) VALUES(?,?,?,?,?,?)',
     		id, title, content, url, author, date);
    var lastInsertRowId = db.lastInsertRowId;
    db.close();
    Ti.App.bookmarksChanged = true;
	return lastInsertRowId;
};

exports.update = function(thumbnail, id){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('UPDATE bookmarks SET thumbnail=? WHERE id=?',thumbnail, id);
	Ti.App.bookmarksChanged = true;
	db.close();
}


