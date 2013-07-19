var DATABASE_NAME = 'articles';

exports.createTable = function(){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('CREATE TABLE IF NOT EXISTS articles \
        (id INTEGER PRIMARY KEY, content TEXT, date TEXT, timestamp INTEGER)');
    db.close();
    
};

exports.exists = function(id) {
	var db = Ti.Database.open(DATABASE_NAME); 
	var resultSet = db.execute('SELECT * FROM articles WHERE id=(?)', id);
	var exists = false;
	
	if (resultSet.isValidRow())
		exists = true;

	resultSet.close();
	db.close();
	return exists;	
};

exports.getAll = function() {
	var db = Ti.Database.open(DATABASE_NAME); 
	var results = [];
	var resultSet = db.execute('SELECT * FROM articles');
	while (resultSet.isValidRow()) {
		results.push({
			id: resultSet.fieldByName('id'),
			content: resultSet.fieldByName('content'),
			date: resultSet.fieldByName('date'),
			timestamp: resultSet.fieldByName('timestamp'),
		});
		resultSet.next();
	}
	resultSet.close();
	db.close();
	return results;
};

exports.dropTable = function(){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DROP TABLE articles');
    db.close();
};      

exports.deleteAll = function(){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute('DELETE FROM articles');
    db.close();
};

exports.deleteId = function(id){
	var db = Ti.Database.open(DATABASE_NAME);
    db.execute('DELETE FROM articles WHERE id=(?)', id);
    db.close();
	
};

exports.remove = function(id){
	var db = Ti.Database.open(DATABASE_NAME); 
    db.execute("DELETE FROM articles WHERE id = ?", id);
    var rowsAffected = db.rowsAffected;
    db.close();
    return rowsAffected;
};

exports.insert = function(id, content, date){
	var timestamp = Math.round(new Date().getTime() / 1000)
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('INSERT INTO articles (id, content, date, timestamp) VALUES(?,?,?,?)',
     		id, contentl, date, timestamp);
    var lastInsertRowId = db.lastInsertRowId;
    db.close();
	return lastInsertRowId;
};

exports.update = function(thumbnail, id){
	var db = Ti.Database.open(DATABASE_NAME);
	db.execute('UPDATE articles SET thumbnail=? WHERE id=?',thumbnail, id);
	db.close();
}


