const request = require("request");
const parseString = require("xml2js").parseString;

API_BASE_URL = "https://www.boardgamegeek.com/xmlapi2/";
SEARCH = "search?";
THING = "thing?";

class BoardGameGeekApi {
  constructor() {
    this.cache = {};
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
          resolve(result);
        });
      });
    });
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
}

module.exports = new BoardGameGeekApi();
