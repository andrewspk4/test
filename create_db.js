var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('vb');
var users = [
	{email:'andrew@mail.com', passw:'andrew'},
	{email:'werdna@mail.com', passw:'werdna'},
	{email:'werdna@liam.moc', passw:'liam.moc'}
];
db.serialize(function() {
	db.run('CREATE TABLE users (user_id INT, email TEXT, passw TEXT)');

	var iV = db.prepare('INSERT INTO users VALUES (?,?,?)');
	for(var i = 0; i < users.length; i++){
		iV.run(i, users[i].email, users[i].passw);
	}
	iV.finalize();
});
console.log('Success');
db.close();