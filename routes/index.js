var express = require("express");
var router = express.Router();
var config = require("./../config");
var fs = require("fs");
var path = require("path");
var http = require("http");

/* GET home page. */
router.get("/", function(req, res, next) {
  let data;
  if (config.use_test_data) {
    const rawdata = fs
      .readFileSync(path.resolve(__dirname, "../test-data/data.json"))
      .toString();
    data = JSON.parse(rawdata);
    res.render("index", {
      s: require("underscore.string"),
      ...data,
    });
  } else {
    http.get(config.library_endpoint, response => {
      if (response.statusCode / 100 == 2) {
        data = JSON.parse(response.body);
        res.render("index", {
          s: require("underscore.string"),
          ...data,
        });
      } else {
        res.render("error", {
          message: response.statusMessage,
          error: {
            status: response.statusCode,
          },
        });
      }
    });
  }
});

module.exports = router;
