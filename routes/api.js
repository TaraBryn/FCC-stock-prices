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
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stocks = req.query.stock;
    if (!Array.isArray(stock)) stock = [stock];
    if(stock.length > 2) stock.splice(2);
    db.collection('stocks').insertOne(stock.map(stoc))
  });
};
