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

function makeRequest(url, done){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
      
    }
  });
  /*var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = () => done(null, xhr.response);
  xhr.onerror = () => done(xhr.response);
  xhr.send();*/
}

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
      makeRequest(url, (err, data) => {
        if (err) console.log(err);
        console.log(data)
      })
      /*dataReq.onload=new Promise(function(){
        var rawData = JSON.parse(dataReq.responseText);
        var data = rawData['Time Series (Daily)'];
        var keys = Object.keys(data).sort((a,b)=>a-b);
        return data[keys[0]];
      })
      return new Promise (dataReq.send()).then(data=>data);*/
    }))
  });
};
