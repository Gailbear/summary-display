const request = require("request");
const parseString = require("xml2js").parseString;
const download = require("image-downloader");
const s = require("underscore.string");
const path = require("path");
const fs = require("fs");

API_BASE_URL = "https://www.boardgamegeek.com/xmlapi2/";
SEARCH = "search?";
THING = "thing?";
FILE_DESTINATION = path.resolve(__dirname, "..", "public", "images", "games");

class BoardGameGeekApi {
  constructor() {
    this.cache = JSON.parse(
      fs
        .readFileSync(path.resolve(__dirname, "..", "data", "bgg.cache"))
        .toString()
    );
    this.change_cached_image_file = this.change_cached_image_file.bind(this);
  }

  getId(title) {
    if (this.cache[title]) return Promise.resolve(this.cache[title]);
    return new Promise((resolve, reject) => {
      this.search(title).then(data => {
        if (!data || !data.items || !data.items.item) {
          reject("no such object");
        }
        resolve(data.items.item[0].$.id);
      });
    });
  }

  search(title) {
    return new Promise((resolve, reject) => {
      const uri =
        API_BASE_URL +
        SEARCH +
        "query=" +
        encodeURIComponent(title) +
        "&type=boardgame&exact=1";
      request.get(uri, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }
        if (response.statusCode < 400) {
          parseString(body, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  }

  getInfo(title) {
    if (this.cache[title]) return Promise.resolve(this.cache[title]);
    return new Promise((resolve, reject) => {
      this.getId(title).then(id => {
        this.thing(id).then(data => {
          const basething = data.items.item[0];
          const result = {
            id,
            thumbnail: basething.thumbnail[0],
            image: basething.image[0],
            rating: basething.statistics[0].ratings[0].average[0].$.value,
          };
          this.cache[title] = result;
          this.download_image(title, "image", result.image);
          this.download_image(title, "thumbnail", result.thumbnail);
          resolve(result);
        });
      });
    });
  }

  download_image(game_title, key, image_url) {
    let filename = s(game_title)
      .slugify()
      .underscored()
      .value();
    if (key === "thumbnail") {
      filename += "_thumb";
    }
    filename += ".jpg";
    const file_path = FILE_DESTINATION + "/" + filename;
    download.image({ url: image_url, dest: file_path }).then(() => {
      this.change_cached_image_file(
        game_title,
        key,
        "images/games/" + filename
      );
    });
  }

  change_cached_image_file(game_title, key, new_path) {
    this.cache[game_title][key] = new_path;
  }

  thing(id) {
    return new Promise((resolve, reject) => {
      const uri = API_BASE_URL + THING + "id=" + id + "&stats=1";
      request.get(uri, (err, response, body) => {
        if (response && response.statusCode < 400) {
          parseString(body, (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          });
        } else {
          reject(err, response);
        }
      });
    });
  }

  clear_cache() {
    this.cache = {};
  }

  save_cache() {
    fs.writeFileSync(
      path.resolve(__dirname, "..", "data", "bgg.cache"),
      JSON.stringify(this.cache)
    );
  }
}

module.exports = new BoardGameGeekApi();
