/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

module.exports = function (app, db) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      //res.send(req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0])
    res.json(req.data)
    });
    
};
