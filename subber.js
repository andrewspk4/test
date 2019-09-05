var pub_port = process.argv[2];
var sub_port = process.argv[3];
if(!isFinite(pub_port) || !isFinite(sub_port)){
	console.log('Error: enter correct pub and sub ports.');
}
else{
	var readline = require('readline-sync');
	var zmq = require('zeromq');
	var pub = zmq.socket('pub');
	var sub = zmq.socket("sub");

	pub.connect('tcp://127.0.0.1:'+pub_port);
	sub.connect('tcp://127.0.0.1:'+sub_port);
	console.log('Publisher bound to port '+pub_port+', subcriber bound to port '+sub_port);

	sub.subscribe("api_out");
	sub.on("message", function(topic, message) {
		var res = JSON.parse(message);
		if(res.status == 'ok')
			console.log(res.status);
		else if(res.status == 'error')
			console.log(res.error);
	});

	var email = readline.question("Enter email:\n");
	var pass = readline.question("Enter password:\n");
	var req = createAuthReq(email, pass);
	pub.send(["api_in", req]);
}
function createAuthReq(email, pass){
	var msg_id = Math.random() * 1000;
	return '{"type": "login", "email": "'+email+'","pwd": "'+pass+'","msg_id": "'+msg_id+'"}';
}