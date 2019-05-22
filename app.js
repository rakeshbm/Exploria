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
require('dotenv').config();

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
  var nextPage = new EventEmitter();
  var token = req.query.token;
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+token+"&key="+process.env.GOOGLE_API_KEY;
  https.get(url, res => {
    res.setEncoding("utf8");
    var html = "";
    var tmp = {};
    res.on("data", data => {
      html += data;
    });
    res.on("end", () => {
      html = JSON.parse(html);
      var results = html.results;
      var length = results.length;
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
      nextPage.result = tmp;
      nextPage.emit('update');
    })
  })
  nextPage.on('update', function() {
    res.send(nextPage.result);
  });
});

app.get('/yelp', (req, res) => {
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var yelpPage = new EventEmitter();
  var query = req.query;
  var name = query.name;
  var addr1 = query.address1;
  var addr2 = query.address2;
  var city = query.city;
  var state = query.state;
  var country = query.country;
  var headers = {
    'Access-Control-Allow-Origin': 'http://localhost:8081/',
    'Authorization': 'Bearer '+ process.env.YELP_KEY
  };

  var apiKey = process.env.YELP_API_KEY;
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
    const yelp = require('yelp-fusion');
    const clientReviews = yelp.client(apiKey);
    clientReviews.reviews(id).then(response => {
    yelpPage.result = response.jsonBody.reviews;
    yelpPage.emit('update');
    }).catch(e => {
      res.send(JSON.stringify("error"));
    });
  }
  yelpPage.on('update', function() {
    res.send(yelpPage.result);
  });
})

app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var query = req.query;
  var keyword = query.keyword;
  var category = query.category.toLowerCase();
  var distance = (query.distance == 'undefined') ? 16093.44 : query.distance*1609.344;
  var location = query.location;
  var lon = parseFloat(query.lon);
  var lat = parseFloat(query.lat);
  var searchPage = new EventEmitter();
  if (location != "undefined") {
    unde(distance, category, keyword);
  }
  else {
    de(lat, lon, distance, category, keyword);
  }

  function de(lat, lon, distance, category, keyword) {
    var url2 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lon+"&radius="+distance+"&type="+category+"&keyword="+keyword+"&key="+process.env.GOOGLE_API_KEY;
    https.get(url2, res2 => {
      res2.setEncoding("utf8");
      var tmp = "";
      res2.on("data", data => {
        tmp += data;
      });
      res2.on("end", () => {
        tmp = JSON.parse(tmp);
        var results = tmp.results;
        var length = results.length;
        var result = [];
        result = {};
        result['token'] = "";
        result['places'] = [];

        if (tmp.next_page_token != 'undefined') {
          result['token'] = tmp.next_page_token;
        }
        for (var i = 0; i < length; i++) {
          result.places[i] = {};
          result.places[i]['icon'] = results[i]['icon'];
          result.places[i]['name'] = results[i]['name'];
          result.places[i]['vicinity'] = results[i]['vicinity'];
          result.places[i]['place_id'] = results[i]['place_id'];
          result.places[i]['location'] = results[i]['geometry']['location'];
        }
        searchPage.result = result;
        searchPage.emit('update');
      })
    })
  }

  function unde(distance, category, keyword) {
    var url1 = "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key="+process.env.GOOGLE_API_KEY;
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
      });
    });
  }

  searchPage.on('update', function() {
    res.send(searchPage.result);
  })

})


var server = app.listen(8081, () => {
  console.log('server is listening on port', server.address().port);
})
