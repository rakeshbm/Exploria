var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const https = require('https');
var url = require('url');
var EventEmitter = require("events").EventEmitter;
var request = require('request');
'use strict';
const helmet = require('helmet');
const csp = require('helmet-csp');
var session = require('express-session');
var validator = require('express-validator');

app.set('trust proxy', 1);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(function(req, res, next) {
  for (var item in req.body) {
    req.sanitize(item).escape();
  }
  next();
});
app.use(helmet.hsts({
  maxAge: 7776000000,
  includeSubdomains: true
}));
app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ['*.google-analytics.com'],
    styleSrc: ["'unsafe-inline'"],
    imgSrc: ['*.google-analytics.com'],
    connectSrc: ["'none'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"]
  }
}));
app.use(session({
  secret: 'hidden sess',
  cookie: {
    maxAge: 3600000,
    secure: true,
    httpOnly: true
  }
}));

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
  });
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
    'Access-Control-Allow-Origin': 'http://localhost:8081/',
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
    // response.setHeader('Content-Type', "application/json");
    // response.header("Access-Control-Allow-Origin", "*");
    // response.header("Access-Control-Allow-Headers", "X-Requested-With");
    // console.log(response.jsonBody.businesses);
    //console.log(response);
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
      // console.log(responseR);
      // responseR.setHeader('Content-Type', "application/json");
      // responseR.header("Access-Control-Allow-Origin", "*");
      // responseR.header("Access-Control-Allow-Headers", "X-Requested-With");
    // console.log(responseR.jsonBody.reviews);
    bd.result = responseR.jsonBody.reviews;
    //console.log(bd.result);
    bd.emit('update');
    }).catch(e => {
      // console.log(e);
      res.send(JSON.stringify("error"));
    });
  }
  bd.on('update', function() {
    res.send(bd.result);
  });
})

app.get('/messages', (req, res) => {
  // console.log(req.body)
  // var que = url.parse(req.url, true).query;
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var que = req.query;
  var keyword = que.keyword;
  var category = que.category.toLowerCase();
  var distance = (que.distance == 'undefined') ? 16093.44 : que.distance*1609.344;
  var location = que.location;
  var lon = parseFloat(que.lon);
  var lat = parseFloat(que.lat);
  var bd = new EventEmitter();
  // console.log(location);
  // console.log(lon);
  // console.log(lat);
  // var ob = null;
  if (location != "undefined") {
    // console.log("unde");
    unde(distance, category, keyword);
  }
  else {
    // console.log("de");
    de(lat, lon, distance, category, keyword);
  }

  function de(lat, lon, distance, category, keyword) {
    var url2 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lon+"&radius="+distance+"&type="+category+"&keyword="+keyword+"&key=AIzaSyAiR9M-WgtlwdnVInIPg6KBs96qoFf1tS4";
    // var url2 = "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyAa82JVs4PT58-oozGACpFLBvuoQbA7IWM";
    https.get(url2, res2 => {
      // console.log(url2);
      res2.setEncoding("utf8");
      // res2.setHeader('Content-Type', "application/json");
      // res2.header("Access-Control-Allow-Origin", "*");
      // res2.header("Access-Control-Allow-Headers", "X-Requested-With");
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
        var lon = parsefloat(body.results[0].geometry.location.lng);
        var lat = parseFloat(body.results[0].geometry.location.lat);
        de(lat, lon, distance, category, keyword);
      })
    })
  }

  bd.on('update', function() {
    res.send(bd.result);
  })

})


var server = app.listen(8081, () => {
  console.log('server is listening on port', server.address().port);
})
