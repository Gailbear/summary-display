var express = require("express");
var router = express.Router();
var config = require("./../config");
var fs = require("fs");
var path = require("path");
var http = require("http");
var bgg = require("../services/bgg");

const rawdata = fs
  .readFileSync(path.resolve(__dirname, "../test-data/data.json"))
  .toString();

const mungeData = async (data, res) => {
  gameInfoPromises = data.games.map(async game => {
    try {
      const info = await bgg.getInfo(game.title);
      return { ...game, ...info };
    } catch (e) {
      // probably no internet
      return { ...game, image: asset_url("images/meeple.svg") };
    }
  });
  data.games = await Promise.all(gameInfoPromises);
  res.render("index", {
    s: require("underscore.string"),
    ...data,
  });
};

/* GET home page. */
router.get("/", async (req, res, next) => {
  let data;
  if (config.use_test_data) {
    data = JSON.parse(rawdata);
    await mungeData(data, res);
  } else {
    http.get(config.library_endpoint, response => {
      if (response.statusCode / 100 == 2) {
        data = JSON.parse(response.body);
        await mungeData(data, res);
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
