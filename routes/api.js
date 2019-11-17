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
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = function (app, db) {
  
  app.route('/api/stock-prices')
  .get(function (req, res){
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stocks = req.query.stock;
    if (!Array.isArray(stocks)) stocks = [stocks];
    if(stocks.length > 2) stocks.splice(2);
    
    Promise.all(stocks.map(e=>{
      var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${e}&apikey=${process.env.API_KEY}`;
      var dataReq = new XMLHttpRequest();
      dataReq.open('GET', url, true);
      return dataReq.onload=()=>Promise(function(){
        var rawData = JSON.parse(dataReq.responseText);
        var data = rawData['Time Series (Daily)'];
        var keys = Object.keys(data).sort((a,b)=>a-b);
        return data[keys[0]];
      }).then(data=>data)
      return 
    }))
    .then(data => {
      console.log(data);
    })
  });
};
