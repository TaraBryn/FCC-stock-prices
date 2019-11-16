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
  
  var apiReq = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-detail");
  
  apiReq.headers({
    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
    'x-rapidapi-key': process.env.RAPID_API_KEY
  })

  app.route('/api/stock-prices')
  .get(function (req, res){
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stock = req.query.stock;
    if (!Array.isArray(stock)) stock = [stock];
    stock.splice(2);
    var stockData;
    try {
      stockData = stock.map(e => {
        apiReq.query({
          region: 'US',
          lang: 'en',
          symbol: e
        })
        return apiReq.end(stockRes => {
          console.log(stockRes.body)
          return stockRes.error || stockRes.body.price
        })
      })
      //console.log(stockData)
    } 
    catch(e) {console.log(e);}
  });
};
