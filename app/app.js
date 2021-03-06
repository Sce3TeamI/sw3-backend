var mysql = require('mysql');
var bcrypt = require('bcrypt');
var express = require('express');
var config = require("./config.json");
var connection = mysql.createConnection(
  {
    host        : config.host,
    user        : config.user,
    password    : config.password,
    database    : config.database,
    port        : config.port
  }
);



///// Functions to deal with the USER /////

//  Checks to see if user exists.
//  Returns true or false
function userExists(user) {
    connection.query('SELECT * FROM users WHERE user = ?', [user], function(err, rows) {
        if (err) throw err;
        if (rows) return true;
        else return false;
    });
};


// Creates new user on the database.
// Takes an input of a JSON object.
function createNewUser(username, password) {
  var salt = bcrypt.genSaltSync(10);

  console.log("Attempting to hash " + password + " with salt " + salt);

  var hash = bcrypt.hashSync(password, salt);

  connection.query('INSERT INTO users (userID, user, password) VALUES (NULL, ?, ?)', [username, hash], function(err2) {
    if (err2)
      throw err2;

    return true;
  });
    // var query2 = 'INSERT INTO citations (user, citationID, title, link, notes) VALUES (' + user.user + user.citationID + user.title + user.link + user.notes + ')';
    // connection.query(query2, function(err) {
    //     if (err) throw err;
    // });
    return false;
};

//  Takes in username in string format.
//  Returns user object in JSON
function getUser(username) {
    var retUser;
    // var query = 'SELECT users.userID, users.password, citations.* FROM users JOIN citations ON users.user = citations.user WHERE citations.user = ' + user;
    var query =
    connection.query('SELECT * FROM users WHERE username = ?', [username], function(err, rows) {
        if (err) throw err;
        if (rows)
            retUser = JSON.stringify(rows);
    });
    return retUser;
};

//  Updates password for the inputted user.
//  Takes in user as an object with user and password sub-variables.
function setPassword(user) {
  bcrypt.hash(user.password, 0, function(err, hash) {
    if (err) throw err;

    connection.query('UPDATE users SET password= ? WHERE user = ?', [hash, user.user], function(err) {
      if (err) throw err;
    });
  });
};



/////// Functions to deal with the CITATIONS/REFERENCES /////////

//  Takes in username in string format.
//  Returns references assigned to inputted user as a JSON string.
function getReference(user) {
    var result;
    connection.query('SELECT * FROM citations WHERE user = ?', [user], function(err, rows) {
      if (err) throw err;
      if (rows)
        result = JSON.stringify(rows);
    });
    return result;
};

function addReference(reference) {
  connection.query('INSERT INTO citations (citationID, link, notes, title, user) VALUES (NULL, ?, ?, ?, ?)', [reference.link, reference.notes, reference.title, reference.user], function(err) {
    if (err) throw err;
  });
};

function editReference(reference) {
  connection.query('UPDATE citations SET link = ?, notes = ?, title = ? WHERE citationID = ?)', [reference.link, reference.notes, reference.title, reference.citationID], function(err) {
    if (err) throw err;
  });
};

function removeReference(reference) {
  connection.query('DELETE FROM citations WHERE citationID = ?', [reference], function(err) {
    if (err) throw err;
  });
};




//  Terminates the mysql connection.
function closeConnection() {
    connection.end();
};


// //Here starts the server connection setting.
// var net = require('net');

// var SERVER_HOST = '127.0.0.1'
// var SERVER_PORT = '3000'

// //Initiate connection to the server
// var client = new net.Socket();
// client.connect(PORT, HOST, function() {
// 	console.log('Connected');
// 	client.write('Hello, server! From Client.');
// });

// //Gets response from server
// client.on('data', function(data) {
// 	console.log('Received: ' + data);
// 	client.destroy(); // kill client after server's response
// });

// //Close connection with server.
// client.on('close', function() {
// 	console.log('Connection closed');
// });
// //Here we finish the server connection functions.


/***Here starts the rest-api code.***/
var app = express();
var router = express.Router();
var API_PORT = 3000 //***TODO: SET THIS***
app.use('/api', router);
app.listen(API_PORT);

router.get('/',function(req, res){
    console.log('root');
    res.send('API_ROOT');
});

//User Login Function. Make a URI: http://HOST:PORT/api/loginuser?username=INPUT_USERNAME&password=INPUT_PASSWORD
router.get('/loginUser', function(req, res) {
  console.log("login");
	var username = req.query.username;
	var password = req.query.password;
  console.log("Username: " + username);
  console.log("Password: " + password);
	if (userExists(username)){
		var currentUser = JSON.parse(getUser(username));
    if (bcrypt.compareSync(password, currentUser.password)) {
      req.session.user = username;
      req.send(getReference(currentUser));
    }
    else {
      res.send('WRONG_PASSWORD');
    }
    // bcrypt.compare(password, currentUser.password, function(err, passRes) {
    //   if (passRes == false) {
    //     res.send('WRONG_PASSWORD')
    //   }
    //   else {
    //     res.send(getReference(currentUser));
    //   }
    // });

	}
  else {
    res.send('USER_DOES_NOT_EXIST');
  }
});

//CreatUser Funtion. Make a URI: http://HOST:PORT/api/createuser?username=INPUT_USERNAME&password=INPUT_PASSWORD
router.get('/createUser', function(req, res){
  var username = req.query.username;
	var password = req.query.password;

  console.log("Make user: " + username);

  if (userExists(username))
  {
    res.send('USER_EXISTS');
  }
  else
  {
    if (createNewUser(username, password))
    {
      res.send('SUCCESS');
    }
    else
    {
      res.send('FAILURE');
    }
  }

});

//User Login Function. Make a URI: http://HOST:PORT/api/addreference?
router.get('/addReference', function(req, res){
  //var refID = req.query.referenceID
  //title, link, notes,
  var title = req.query.title;
  var link = req.query.link;
  var notes = req.query.notes;
  var user = req.query.user;
  var reference = {
    title: title,
    link: link,
    notes: notes,
    user: user
  };
  addReference(reference)
  res.send('REF_ADDED');
});

router.get('/removeReference', function(req, res){
  var citationID = req.query.citationID;
  removeReference(citationID);
  res.send('REF_REMOVED');
});

router.get('/editReference', function(req, res){
  var citationID = req.query.citationID;
  var title = req.query.title;
  var link = req.query.link;
  var notes = req.query.link;
  var user = req.query.user;
  var reference = {
    citationID: citationID,
    title: title,
    link: link,
    notes: notes,
    user: user
  };
  editReference(reference);
  res.send('REF_EDITED');
});

router.get('/getUserReferences', function(req, res){
  var user = req.query.user;
  var result = getReference(user);
  res.send(result);
});

/***Here finishes the rest-api code.***/
