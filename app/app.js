var mysql = require('mysql');
var connection = mysql.connection({
    host        : 'localhost',
    user        : 'root',
    password    : 'test2',
    port        : '8889'
});


//  Checks to see if user exists.
//  Returns true or false
function userExists(user) {
    var query = 'SELECT * FROM users WHERE user = ' + user;
    connection.query(query, function(err, rows) {
        if (err) throw err;
        if (rows) return true;
        else return false;
    });
};


// Creates new user on the database.
// Takes an input of a JSON object.
function createNewUser(user) {
    var query1 = 'INSERT INTO users (userID, user, password) VALUES (' + user.userID + user.user + user.password + ')';
    connection.query(query1, function(err) {
        if (err) throw err;
    });

    var query2 = 'INSERT INTO citations (user, citationID, title, link, notes) VALUES (' + user.user + user.citationID + user.title + user.link + user.notes + ')';
    connection.query(query2, function(err) {
        if (err) throw err;
    });
};


//  Returns user object in JSON
function getUser(user) {
    var retUser;
    var query = 'SELECT * FROM users WHERE user = ' + user;
    connection.query(query, function(err, rows) {
        if (err) throw err;
        if (rows)
            retUser = JSON.stringify(rows);
    });
    return retUser;
};


//  Terminates the mysql connection.
function closeConnection() {
    connection.end();
};


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

