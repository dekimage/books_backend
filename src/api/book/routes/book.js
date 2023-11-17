"use strict";

/**
 * book router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;
module.exports = createCoreRouter("api::book.book");
// module.exports = createCoreRouter("api::book.book", {
//   config: {
//     find: {
//       policies: ["global::isUser"],
//     },
//   },
// });
