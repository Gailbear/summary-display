var express = require("express");
var router = express.Router();
const bgg = require("./../services/bgg");

router
  .get("/thumbnail/:title", function(req, res) {
    bgg
      .getInfo(decodeUriComponent(req.params.title))
      .then(d => res.send({ title, thumbnail: d.thumbnail }));
  })
  .get("/game/:title", function(req, res) {
    bgg
      .getInfo(decodeUriComponent(req.params.title))
      .then(d => res.send({ title, ...d }));
  })
  .get("/save-cache", function(req, res) {
    bgg.save_cache();
    res.sendStatus(200);
  })
  .get("/clear-cache", function(req, res) {
    bgg.clear_cache();
    res.sendStatus(200);
  });

module.exports = router;
