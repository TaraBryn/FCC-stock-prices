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
var unirest = require('unirest');

module.exports = function (app, db) {
  
  //var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-detail");
  
  /*req.headers({
    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
    'x-rapidapi-key': process.env.RAPID_API_KEY
  })*/

  app.route('/api/stock-prices')
  .get(function (req, res){
    console.log('test');
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stock = req.body.stock;
    res.json(req.body);
  });
    
};
