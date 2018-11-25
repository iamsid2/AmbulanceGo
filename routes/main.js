var router = require('express').Router();



router.get('/', function (req, res) {
    res.render('AmbulanceGo');
});

router.get('/citizen', function(req, res) {
    res.render('citizen', {
        userId: req.query.userId
    });
});

router.get('/ambulance', function(req, res) {
    res.render('ambulance', {
        userId: req.query.userId
    });
});

router.get('/data', function(req, res) {
    res.render('data');
});

module.exports = router;
