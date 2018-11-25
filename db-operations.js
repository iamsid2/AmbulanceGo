function fetchNearestambulance(db, coordinates, callback) {

    db.collection("policeData").createIndex({
        "location": "2dsphere"
    }, function() {
        db.collection("policeData").find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $maxDistance: 2000
                }
            }
        }).toArray(function(err, results) {
            if (err) {
                console.log(err)
            } else {
                callback(results);
            }
        });
    });
}

function fetchambulanceDetails(db, userId, callback) {
    db.collection("policeData").findOne({
        userId: userId
    }, function(err, results) {
        if (err) {
            console.log(err)
        } else {
          console.log(results);
            callback({
                ambulanceId: results.userId,
                displayName: results.displayName,
                phone: results.phone,
                location: results.location
            });
        }
    });
}

function saveRequest(db, requestId, requestTime, location, citizenId, status, callback) {
    db.collection("requestsData").insert({
        "_id": requestId,
        requestTime: requestTime,
        location: location,
        citizenId: citizenId,
        status: status
    }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            callback(results);
        }
    });
}

function updateRequest(db, issueId, ambulanceId, status, callback) {
    db.collection("requestsData").update({
        "_id": issueId
    }, {
        $set: {
            status: status,
            ambulanceId: ambulanceId
        }
    }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            callback("Issue updated")
        }
    });
}

function fetchRequests(db, callback) {
    var collection = db.collection("requestsData");
    //Using stream to process lots of records
    var stream = collection.find({}, {
        requestTime: 1,
        status: 1,
        location: 1,
        _id: 0
    }).stream();

    var requestsData = [];

    stream.on("data", function(request) {
        requestsData.push(request);
    });
    stream.on('end', function() {
        callback(requestsData);
    });
}

exports.fetchNearestambulance = fetchNearestambulance;
exports.fetchambulanceDetails = fetchambulanceDetails;
exports.saveRequest = saveRequest;
exports.updateRequest = updateRequest;
exports.fetchRequests = fetchRequests;
