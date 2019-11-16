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
      
    });
    
};
