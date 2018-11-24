var http = require("http");
var express = require("express");
var ejs = require('ejs');
var engine = require('ejs-mate');
var consolidate = require("consolidate"); //1
var _ = require("underscore");
var bodyParser = require('body-parser');

var routes = require('./routes'); //File that contains our endpoints
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

app.set('views', 'views'); //Set the folder-name from where you serve the html page.
app.use(express.static('./public')); //setting the folder name (public) where all the static files like css, js, images etc are made available

app.engine('ejs', engine);
app.set('view engine', 'ejs');//Use underscore to parse templates when we do res.render

var server = http.Server(app);
var portNumber = process.env.PORT || 9900; //for locahost:8000

var io = require('socket.io')(server); //Creating a new socket.io instance by passing the HTTP server object

server.listen(portNumber, function() { //Runs the server on port 8000
    console.log('Server listening at port ' + portNumber);

    // var url = 'mongodb://localhost:27017/ambulancego'; //Db name
    var url = 'mongodb://sid:iamsid2@ds115664.mlab.com:15664/ambulancego'
    mongoClient.connect(url, function(err, db) { //a connection with the mongodb is established here.
        console.log("Connected to Database");

        app.get('/citizen', function(req, res) { //a request to /citizen.html will render our citizen.html page
            //Substitute the variable userId in citizen.html with the userId value extracted from query params of the request.
            res.render('citizen', {
                userId: req.query.userId
            });
        });

        app.get('/cop', function(req, res) {
            res.render('cop', {
                userId: req.query.userId
            });
        });

        app.get('/data', function(req, res) {
            res.render('data');
        });

        io.on('connection', function(socket) { //Listen on the 'connection' event for incoming sockets
            console.log('A user just connected');

            socket.on('join', function(data) { //Listen to any join event from connected users
                socket.join(data.userId); //User joins a unique room/channel that's named after the userId
                console.log("User joined room: " + data.userId);
            });

            routes.initialize(app, db, socket, io); //Pass socket and io objects that we could use at different parts of our app
        });
    });
});

/* 1. Not all the template engines work uniformly with express, hence this library in js, (consolidate), is used to make the template engines work uniformly. Altough it doesn't have any
modules of its own and any template engine to be used should be seprately installed!*/
