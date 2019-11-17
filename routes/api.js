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

function makeRequest(url){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300)
        resolve(JSON.parse(xhr.responseText));
      else reject({
        status: this.status,
        statusText: xhr.statusText
      });
    }
    xhr.onerror = function(){
      reject({
        status: this.status,
        statusText: this.statusText
      })
    };
    xhr.send();
  });
}

module.exports = function (app, db) {
  
  function updateDB(data, docs){
    return new Promise(function(resolve, reject){
      db.collection.find({symbol: {$in: data.map(e=>e.symbol)}})
      .toArray().then(docs => {
        var result = {};
        var docSymbols = docs.map(doc=>doc.symbol);
        data.forEach(stock => {
          var docIndex = docSymbols.indexOf(stock);
          if (docIndex == -1) {
            db.collection.insert
          } else if (docs[docIndex].valueData.map(e=>e.date).indexOf(stock.valueData.date) == -1) {
            
          } else {
            
          }
        })
      })
    })
  }
  
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
      return makeRequest(url)
      .then(data => {
        var metaData = data['Meta Data'];
        var valueData = data["Time Series (Daily)"];
        var dates = Object.keys(valueData).sort((a,b)=>a-b);
        return {
          symbol: metaData['2. Symbol'],
          timeZone: metaData['5. Time Zone'],
          valueData: Object.assign({date: dates[0]}, valueData[dates[0]])
        }
      })
      .catch(err => console.log('Promise Error: ', err))
    }))
    .then(data => {
      
    })
    .catch(err => res.json(err));
  });
};
