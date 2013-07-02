var DATABASE_NAME = 'bookmarks';

exports.createTable = function(){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('CREATE TABLE IF NOT EXISTS bookmarks \
        (id INTEGER PRIMARY KEY, title TEXT, content TEXT, url TEXT, author TEXT, date TEXT)');
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
			date: resultSet.fieldByName('date')
		});
		resultSet.next();
	}
	resultSet.close();
	db.close();
	return results;
};

exports.dropTable = function(){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DROP TABLE bookmarks');
    db.close();
};      

exports.deleteAll = function(){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DELETE FROM bookmarks');
    db.close();
};

exports.deleteId = function(id){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DELETE FROM bookmarks WHERE id=(?)', id);
    db.close();
};

exports.remove = function(id){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute("DELETE FROM bookmarks WHERE id = ?", id);
    db.close();
    return db.rowsAffected;
};

exports.insert = function(id, title, content, url, author, date){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('INSERT INTO bookmarks (id, title, content, url, author, date) VALUES(?,?,?,?,?,?)',
     		id, title, content, url, author, date);
    db.close();
    return db.lastInsertRowId;
};


