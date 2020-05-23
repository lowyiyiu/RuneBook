const cheerio = require("cheerio");
const request = require("request");

const url = "http://www.op.gg/urf/";

function extractRunePagesFromElement($, champion) {
  const getPerkIdFromImg = (_, elem) => $(elem).attr("src").split("/").slice(-1).pop().split(".")[0];

  return (runePageElement, index) => {
    const stats = $(runePageElement)
      .find(".champion-overview__stats strong")
      .map((i, elem) => $(elem).text())
      .get();

    const name = `${champion} PR${stats[0]} WR${stats[1]}`;

    const styles = $(runePageElement).find(".champion-overview__data .perk-page .perk-page__item--mark img").map(getPerkIdFromImg).get();

    // normal runes
    let selectedPerkIds = $(runePageElement).find(".champion-overview__data .perk-page .perk-page__item--active img").map(getPerkIdFromImg).get();

    // stat shards
    selectedPerkIds = selectedPerkIds.concat($(runePageElement).find(".champion-overview__data .fragment-page img.active").map(getPerkIdFromImg).get());

    return {
      name,
      primaryStyleId: styles[0],
      subStyleId: styles[1],
      selectedPerkIds,
      bookmark: {
        src: url + champion + "/statistics/",
        meta: {
          pageType: index,
          champion,
        },
        remote: {
          name: "OP.GG URF",
          id: "opggurf",
        },
      },
    };
  };
}

function parsePage($, champion) {
  return $("tbody[class*='ChampionKeystoneRune-'] tr").toArray().map(extractRunePagesFromElement($, champion));
}

function parseSinglePage($, champion, pageType) {
  const element = $("tbody[class*='ChampionKeystoneRune-'] tr").get(pageType);
  return extractRunePagesFromElement($, champion)(element, pageType);
}

function extractPages(html, champion, callback) {
  const $ = cheerio.load(html);
  let pages = [];

  pages = pages.concat(parsePage($, champion));
  callback(pages);
}

function _getPages(champion, callback) {
  const runePages = { pages: {} };

  const entryChampUrl = url + champion + "/statistics/";

  request.get(entryChampUrl, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      extractPages(html, champion, (pages) => {
        pages.forEach((page) => {
          runePages.pages[page.name] = page;
        });
        callback(runePages);
      });
    } else {
      callback(runePages);
      throw Error("rune page not loaded");
    }
  });
}

const plugin = {
  id: "opggurf",
  name: "OP.GG URF",
  active: true,
  bookmarks: true,
  getPages(champion, callback) {
    _getPages(champion, callback);
  },
  syncBookmark(bookmark, callback) {
    request.get(bookmark.src, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const position = bookmark.src.split("/").pop();
        callback(parseSinglePage(cheerio.load(html), bookmark.meta.champion, bookmark.meta.pageType));
      } else {
        throw Error("rune page not loaded");
      }
    });
  },
};

module.exports = { plugin };
