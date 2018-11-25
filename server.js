var http = require("http");
var express = require("express");
var ejs = require('ejs');
var engine = require('ejs-mate');
var bodyParser = require('body-parser');

var routes = require('./routes');
var mongoClient = require("mongodb").MongoClient;

var app = express();
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json({
    limit: '5mb'
}));

var routes = require('./routes');
var mainRoutes = require('./routes/main');

app.use(mainRoutes)

app.set('views', 'views');
app.use(express.static('./public'));

app.engine('ejs', engine);
app.set('view engine', 'ejs');

var server = http.Server(app);
var portNumber = process.env.PORT || 9900;

var io = require('socket.io')(server);

server.listen(portNumber, function() {
    console.log('Server listening at port ' + portNumber);

    // var url = 'mongodb://localhost:27017/ambulancego';
    var url = 'mongodb://sid:iamsid2@ds115664.mlab.com:15664/ambulancego'
    mongoClient.connect(url, function(err, db) {
        console.log("Connected to Database");


        io.on('connection', function(socket) { 
            console.log('A user just connected');

            socket.on('join', function(data) { //Listen to any join event from connected users
                socket.join(data.userId); //User joins a unique room/channel that's named after the userId
                console.log("User joined room: " + data.userId);
            });

            routes.initialize(app, db, socket, io);
        });
    });
});
