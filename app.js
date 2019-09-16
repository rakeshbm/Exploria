var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const https = require('https');
var url = require('url');
var EventEmitter = require("events").EventEmitter;
var request = require('request');
'use strict';



app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/next', (req, res) => {
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var bd = new EventEmitter();
  var token = req.query.token;
  var url3 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+token+"&key=AIzaSyAiR9M-WgtlwdnVInIPg6KBs96qoFf1tS4";
  https.get(url3, res3 => {
    res3.setEncoding("utf8");
    var html = "";
    var tmp = {};
    res3.on("data", data => {
      html += data;
    });
    res3.on("end", () => {
      html = JSON.parse(html);
      var resu = html.results;
      var length = resu.length;
      tmp['places'] = [];
      tmp['token'] = "";
      if (html.next_page_token != 'undefined') {
        tmp['token'] = html.next_page_token;
      }
      for (var i = 0; i < length; i++) {
        tmp.places[i] = {};
        tmp.places[i]['icon'] = resu[i]['icon'];
        tmp.places[i]['name'] = resu[i]['name'];
        tmp.places[i]['vicinity'] = resu[i]['vicinity'];
        tmp.places[i]['place_id'] = resu[i]['place_id'];
        tmp.places[i]['location'] = resu[i]['geometry']['location'];
      }
      bd.result = tmp;
      bd.emit('update');
    })
  })
  bd.on('update', function() {
    res.send(bd.result);
  })
})

app.get('/yelp', (req, res) => {
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var bd = new EventEmitter();
  var que = req.query;
  var name = que.name;
  var addr1 = que.address1;
  var addr2 = que.address2;
  var city = que.city;
  var state = que.state;
  var country = que.country;
  var headers = {
    // 'Access-Control-Allow-Origin': 'http://localhost:8081/',
    'Authorization': 'Bearer Qy-YxhQ8MycJw68-woih7f5YG9CuCiWpyQsau32mLiYECsh3eLM5cXb_TzMFrDbKRrPZl2abzrq2D51tsKUOiifA6XGontfXj2zj-DHjIabW2m8fYLE_EOmOyEmZXHYx'
  };

  var apiKey = "Qy-YxhQ8MycJw68-woih7f5YG9CuCiWpyQsau32mLiYECsh3eLM5cXb_TzMFrDbKRrPZl2abzrq2D51tsKUOiifA6XGontfXj2zj-DHjIabW2m8fYLE_EOmOyEmZXHYx";
  const yelp = require('yelp-fusion');

  const client = yelp.client(apiKey);
  client.businessMatch('best', {
    name: name,
    address1: addr1,
    address2: city+', '+addr2,
    city: city,
    state: state,
    country: country
  }).then(response => {
    console.log(response);
    if (response.jsonBody.businesses.length != 0) {
      yelpReviews(response.jsonBody.businesses[0].id);
    }
    else {
      res.send([]);
    }
  }).catch(e => {
    res.send("error");
  });
  function yelpReviews(id) {
    const yelpR = require('yelp-fusion');
    const clientR = yelpR.client(apiKey);
    clientR.reviews(id).then(responseR => {
    bd.result = responseR.jsonBody.reviews;
    console.log(bd.result);
    bd.emit('update');
    }).catch(e => {
      res.send(JSON.stringify("error"));
    });
  }
  bd.on('update', function() {
    res.send(bd.result);
  })
})

app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var que = req.query;
  var keyword = que.keyword;
  var category = que.category.toLowerCase();
  var distance = (que.distance == 'undefined') ? 16093.44 : que.distance*1609.344;
  var location = que.location;
  var lon = que.lon;
  var lat = que.lat;
  var bd = new EventEmitter();
  if (location != "undefined") {
    unde(distance, category, keyword);
  }
  else {
    de(lat, lon, distance, category, keyword);
  }

  function de(lat, lon, distance, category, keyword) {
    var url2 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lon+"&radius="+distance+"&type="+category+"&keyword="+keyword+"&key=AIzaSyAiR9M-WgtlwdnVInIPg6KBs96qoFf1tS4";
    https.get(url2, res2 => {
      res2.setEncoding("utf8");
      var rr = "";
      res2.on("data", data => {
        rr += data;
      });
      res2.on("end", () => {
        rr = JSON.parse(rr);
        var resu = rr.results;
        var length = resu.length;
        var result = [];
        result = {};
        result['token'] = "";
        result['places'] = [];

        if (rr.next_page_token != 'undefined') {
          result['token'] = rr.next_page_token;
        }
        for (var i = 0; i < length; i++) {
          result.places[i] = {};
          result.places[i]['icon'] = resu[i]['icon'];
          result.places[i]['name'] = resu[i]['name'];
          result.places[i]['vicinity'] = resu[i]['vicinity'];
          result.places[i]['place_id'] = resu[i]['place_id'];
          result.places[i]['location'] = resu[i]['geometry']['location'];
        }
        bd.result = result;
        bd.emit('update');
      })
    })
  }

  function unde(distance, category, keyword) {
    var url1 = "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyAiR9M-WgtlwdnVInIPg6KBs96qoFf1tS4";
    https.get(url1, res1 => {
      res1.setEncoding("utf8");
      var body = "";
      res1.on("data", data => {
        body += data;
      });
      res1.on("end", () => {
        body = JSON.parse(body);
        var lon = body.results[0].geometry.location.lng;
        var lat = body.results[0].geometry.location.lat;
        de(lat, lon, distance, category, keyword);
      })
    })
  }

  bd.on('update', function() {
    res.send(bd.result);
  })

})


var server = app.listen(process.env.PORT || 8081, () => {
  console.log('server is listening on port', server.address().port);
})
