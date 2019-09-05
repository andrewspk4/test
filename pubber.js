var pub_port = process.argv[2];
var sub_port = process.argv[3];
if(!isFinite(pub_port) || !isFinite(sub_port)){
	console.log('Error: enter correct pub and sub ports.');
}
else{
	var zmq = require('zeromq');
	var pub = zmq.socket('pub');
	var sub = zmq.socket('sub');
	pub.bindSync('tcp://127.0.0.1:'+pub_port);
	sub.bindSync('tcp://127.0.0.1:'+sub_port);
	console.log('Publisher bound to port '+pub_port+', subcriber bound to port '+sub_port);
	
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('vb');

	sub.subscribe('api_in');
	sub.on('message', function(topic, message) {
		var req = JSON.parse(message);
		var res;
		if(req.type != 'login')
			return;
		if(req.email == '' || req.pwd == ''){
	  		res = createErrorRes(req.msg_id, 'WRONG_FORMAT');
	  		pub.send(["api_out", res]);
	  		return;
	  	}
	  	db.get('SELECT user_id, email, passw FROM users WHERE email = ?', req.email, function(err, row) {
			if (!row){
				res = createErrorRes(req.msg_id, 'WRONG_PWD');
				pub.send(["api_out", res]);
				return;
			}
			if(row.email == req.email && row.passw == req.pwd)
				res = createSuccessRes(req.msg_id, row.user_id);
			else
				res = createErrorRes(req.msg_id, 'WRONG_PWD');
			pub.send(["api_out", res]);
		});	
	});
}

function createErrorRes(msg_id, reason){
	return '{"msg_id":"'+msg_id+'", "status":"error", "error":"'+reason+'"}';
}
function createSuccessRes(msg_id, user_id){
	return '{"msg_id":"'+msg_id+'", "user_id": "'+user_id+'" , "status":"ok"}';
}
