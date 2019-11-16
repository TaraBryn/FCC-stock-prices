/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;
var $ = require('jquery');

module.exports = function (app, db) {
  
  app.route('/api/stock-prices')
  .get(function (req, res){
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stocks = req.query.stock;
    if (!Array.isArray(stocks)) stocks = [stocks];
    if(stocks.length > 2) stocks.splice(2);
    Promise.all(stocks.map(e=>{
      $.ajax({
        type: 'GET'
        
      })
    }))
    .then(data => {
      
    })
  });
};
