var dbOperations = require('./db-operations');

function initialize(app, db, socket, io) {
    app.get('/ambulance', function(req, res) {
        var latitude = Number(req.query.lat);
        var longitude = Number(req.query.lng);
        dbOperations.fetchNearestambulance(db, [longitude, latitude], function(results) {
            res.json({
                ambulance: results
            });
        });
    });

    // '/ambulance/info?userId=01'
    app.get('/ambulance/info', function(req, res) {
        var userId = req.query.userId //extract userId from quert params
        dbOperations.fetchambulanceDetails(db, userId, function(results) {
            res.json({
                ambulanceDetails: results
            });
        });
    });

    //Listen to a 'request-for-help' event from connected citizens
    socket.on('request-for-help', function(eventData) {

        var requestTime = new Date(); //Time of the request

        var ObjectID = require('mongodb').ObjectID;
        var requestId = new ObjectID; //Generate unique ID for the request
        var location = {
            coordinates: [
                eventData.location.longitude,
                eventData.location.latitude
            ],
            address: eventData.location.address
        };
        dbOperations.saveRequest(db, requestId, requestTime, location, eventData.citizenId, 'waiting', function(results) {

            //2. AFTER saving, fetch nearby ambulance from citizen’s location
            dbOperations.fetchNearestambulance(db, location.coordinates, function(results) {
                eventData.requestId = requestId;
                //3. After fetching nearest ambulance, fire a 'request-for-help' event to each of them
                for (var i = 0; i < results.length; i++) {
                    io.sockets.in(results[i].userId).emit('request-for-help', eventData);
                }
            });
        });
    });

    socket.on('request-accepted', function(eventData) { //Listen to a 'request-accepted' event from connected ambulance
        console.log(eventData);
        //Convert string to MongoDb's ObjectId data-type
        var ObjectID = require('mongodb').ObjectID;
        var requestId = new ObjectID(eventData.requestDetails.requestId);
        dbOperations.updateRequest(db, requestId, eventData.ambulanceDetails.ambulanceId, 'engaged', function(results) {
            io.sockets.in(eventData.requestDetails.citizenId).emit('request-accepted', eventData.ambulanceDetails);
        })

    });

    //Fetch all requests
    app.get('/requests/info', function(req, res) {
        dbOperations.fetchRequests(db, function(results) {
            var features = [];
            for (var i = 0; i < results.length; i++) {
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: results[i].location.coordinates
                    },
                    properties: {
                        status: results[i].status,
                        requestTime: results[i].requestTime,
                        address: results[i].location.address
                    }
                })
            }
            var geoJsonData = {
                type: 'FeatureCollection',
                features: features
            }

            res.json(geoJsonData);
        });
    });

}

exports.initialize = initialize;
