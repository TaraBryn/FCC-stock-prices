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
        var currentValues = valueData[dates[0]];
        return  {
          symbol: metaData['2. Symbol'],
          timeZone: metaData['5. Time Zone'],
          likes: req.query.like ? [ip] : [],
          valueData: [
            {
              date: dates[0],
              open: currentValues['1. open'],
              high: currentValues['2. high'],
              low: currentValues['3. low'],
              close: currentValues['4. close'],
              volume: currentValues['5. volume']
            }
          ]
        }
      })
      .catch(err => console.log('Promise Error: ', err))
    }))
    .then(data => {
      db.collection('stocks').find({symbol: {$in: data.map(e=>e.symbol)}})
      .toArray()
      .then(docs => {
        var docSymbols = docs.map(doc=>doc.symbol);
        Promise.all(data.map(stock => {
          var docIndex = docSymbols.indexOf(stock.symbol);
          if (docIndex == -1) {
            db.collection('stocks').insertOne(stock);
            return {stock: stock.symbol, price: stock.valueData[0].close || stock.valueData[0].open, likes: stock.likes.length};
          } else if (docs[docIndex].valueData.map(e=>e.date).indexOf(stock.valueData[0].date) == -1) {
            let likes = docs[docIndex].likes;
            if (req.query.like) likes.push(ip);
            db.collection('stocks').updateOne({_id: docs[docIndex]._id}, {
              $push: {valueData: stock.valueData[0]},
              $set: {likes}
            });
            return {stock: stock.symbol, price: stock.valueData[0].close || stock.valueData[0].open, likes: likes.length};
          } else {
            let valueData = docs[docIndex].valueData[docs[docIndex].valueData.length-1];
            let likes = docs[docIndex].likes;
            if (req.query.like) likes.push(ip);
            console.log(likes, req.query);
            if (stock.valueData[0].open != valueData.open 
                || stock.valueData[0].high != valueData.high 
                || stock.valueData[0].low != valueData.low 
                || stock.valueData[0].close != valueData.close 
                || stock.valueData[0].volume != valueData.volume 
                || req.query.likes) {
              let updateArg = {
                $set: {
                  'valueData.$.open': stock.valueData[0].open,
                  'valueData.$.high': stock.valueData[0].high,
                  'valueData.$.low': stock.valueData[0].low,
                  'valueData.$.close': stock.valueData[0].close,
                  'valueData.$.volume': stock.valueData[0].volume
                }
              }
              if (req.quer)
              db.collection('stocks').updateMany({
                _id: docs[docIndex]._id, 
                'valueData.date': stock.valueData[0].date},{
                $set: {
                'valueData.$.open': stock.valueData[0].open,
                'valueData.$.high': stock.valueData[0].high,
                'valueData.$.low': stock.valueData[0].low,
                'valueData.$.close': stock.valueData[0].close,
                'valueData.$.volume': stock.valueData[0].volume,
                likes
              }})
            }
            return {stock: stock.symbol, price: stock.valueData[0].close || stock.valueData[0].open, likes: likes.length}
          }
        }))
        .then(data => {
          if (data.length == 2) {
            data[0].rel_likes = data[0].likes - data[1].likes;
            data[1].rel_likes = data[1].likes - data[0].likes;
            delete data[0].likes;
            delete data[1].likes;
          }
          res.json(data);
        })
        .catch(err=>console.log(err))
      })
      .catch(err=>console.log(err))
    })
    .catch(err => res.json(err));
  });
};
