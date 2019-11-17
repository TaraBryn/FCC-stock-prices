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
  
  app.route('/api/stock-prices')
  .get(function (req, res){
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stocks = req.query.stock;
    if (!Array.isArray(stocks)) stocks = [stocks];
    if(stocks.length > 2) stocks.splice(2);
    Promise.all(stocks.map(e=>{
      var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${e}&apikey=${process.env.API_KEY}`;
      return makeRequest(url)
      .then(data => {
        var metaData = data['Meta Data'];
        var valueData = data["Time Series (Daily)"];
        var dates = Object.keys(valueData).sort((a,b)=>a-b);
        return {
          symbol: metaData['2. Symbol'],
          timeZone: metaData['5. Time Zone'],
          likes: req.query.likes ? [ip] : [],
          valueData: [Object.assign({date: dates[0]}, valueData[dates[0]])]
        }
      })
      .catch(err => console.log('Promise Error: ', err))
    }))
    .then(data => {
      db.collection.find({symbol: {$in: data.map(e=>e.symbol)}})
      .toArray().then(docs => {
        var docSymbols = docs.map(doc=>doc.symbol);
        Promise.all(data.map(stock => {
          var docIndex = docSymbols.indexOf(stock.symbol);
          if (docIndex == -1) {
            db.collection('stocks').insertOne(stock);
            return {stock: stock.symbol, price: stock.valueData[0].close || stock.value[0].open, likes: stock.likes.length};
          } else if (req.query.likes || docs[docIndex].valueData.map(e=>e.date).indexOf(stock.valueData[0].date) == -1) {
            let likes = docs[docIndex].likes;
            if (req.query.likes) likes.push(ip);
            db.collection('stocks').updateOne({_id: docs[docIndex]._id}, {
              $push: {valueData: stock.valueData[0]},
              $set: {likes}
            });
            return {stock: stock.symbol, price: stock.valueData[0].close || stock.valueData[0].open, likes: likes.length};
          } else {
            let valueData = docs[docIndex].valueData;
            if (stocks.valueData.open != valueData.open 
                || stock.valueData.high != valueData.high 
                || stock.valueData.low != valueData.low 
                || stock.valueData.close != valueData.close 
                || stock.valueData.volume != valueData.volume 
                || req.query.likes) {
              let likes = docs[docIndex].likes;
              if (req.query.likes) likes.push(ip);
              db.collection('stocks').updateOne({
                _id: docs[docIndex]._id, 
                'valueData.date': stock.valueData.date},{
                $set: {
                'valueData.$.open': stock.valueData.open,
                'valueData.$.high': stock.valueData.high,
                'valueData.$.low': stock.valueData.low,
                'valueData.$.close': stock.valueData.close,
                'valueData.$.volume': stock.valueData.volume,
                likes
              }})
              return {stock: stock.symbol, price: stock.valueData[0].close || stock.valueData[0].open, likes: likes.length}
            }
          }
        }))
        .then(data => {
          if (data.length == 2) {
            data[0].rel_likes = data[0].likes - data[1].likes;
            data[1].rel_likes = data[1].likes - data[0].likes;
            delete data[0].likes;
            delete data[1].likes;
            res.json(data);
          }
        })
      })
    })
    .catch(err => res.json(err));
  });
};
