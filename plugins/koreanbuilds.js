const request = require("request");
const styles = {
  8000: [8005, 8008, 8021, 8010, 9101, 9111, 8009, 9104, 9105, 9103, 8014, 8017, 8299],
  8100: [8112, 8124, 8128, 9923, 8126, 8139, 8143, 8136, 8120, 8138, 8135, 8134, 8105, 8106],
  8200: [8214, 8229, 8230, 8224, 8226, 8275, 8210, 8234, 8233, 8237, 8232, 8236],
  8300: [8351, 8359, 8360, 8306, 8304, 8313, 8321, 8316, 8345, 8347, 8410, 8352],
  8400: [8437, 8439, 8465, 8446, 8463, 8401, 8429, 8444, 8473, 8451, 8453, 8242],
};
let connected = false;
let json = "";

function connect(callback) {
  request.post("https://runebook.lowyiyiu.com", (error, response, data) => {
    if (!error && response.statusCode == 200) {
      json = JSON.parse(data);
      callback(true);
    } else {
      callback(false);
      throw Error("unable to fetch data");
    }
  });
}

function extractPage(procData) {
  var data = procData;
  var page = {
    name: `${data["champion"]} (Score: ${Math.floor(data["score"])})`,
    primaryStyleId: -1,
    selectedPerkIds: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    subStyleId: -1,
    bookmark: {
      src: "",
      remote: {
        name: plugin.name,
        id: plugin.id,
      },
    },
  };

  page.selectedPerkIds = data["perks"].concat([5008, 5002, 5003]);

  for (var k in styles) {
    if (styles[k].includes(page.selectedPerkIds[0])) {
      page.primaryStyleId = k;
    }
    if (styles[k].includes(page.selectedPerkIds[5])) {
      page.subStyleId = k;
    }
  }

  return page;
}

function _getPages(champion, callback) {
  let result = { pages: {} };

  if (!json) return callback(result);

  for (let i = 0; i < json.length; i++) {
    if (json[i]["champion"] === champion) {
      console.log(json[i]);
      let page = extractPage(json[i]);
      result.pages[page.name] = page;
    }
  }

  callback(result);
}

const plugin = {
  id: "koreanbuilds",
  name: "KoreanBuilds",
  active: true,
  bookmarks: true,

  getPages(champion, callback) {
    if (!connected)
      connect((result) => {
        connected = result;
        _getPages(champion, callback);
      });
    else _getPages(champion, callback);
  },

  syncBookmark(bookmark, callback) {
    // Syncing
  },
};

connect((result) => {
  connected = result;
});

module.exports = { plugin };
