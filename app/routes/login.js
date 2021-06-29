
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    console.log('コンソールログイン');
    res.sendStatus(200);
  });


module.exports = router;