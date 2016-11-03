//Here starts the server connection setting.
var net = require('net');

var HOST = '127.0.0.1'
var PORT = '3000'

//Initiate connection to the server
var client = new net.Socket();
client.connect(PORT, HOST, function() {
	console.log('Connected');
	client.write('Hello, server! From Client.');
});

//Gets response from server
client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

//Close connection with server.
client.on('close', function() {
	console.log('Connection closed');
});
//Here we finish the server connection functions.

