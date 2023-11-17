"use strict";

/**
 * book controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::book.book", ({ strapi }) => ({
  // POSTO USER CONTROLLER E GLUP
  async getUser(ctx) {
    const userId = ctx.state.user.id;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId }, populate: true });
    return user;
  },

  async getMyFavoriteBooks(ctx) {
    const userId = ctx.state.user.id;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
        populate: {
          saved_books: { populate: { image: true, category: true } },
        },
      });

    return user.saved_books;
  },

  async favoriteBook(ctx) {
    const { id } = ctx.request.body;
    const userId = ctx.state.user.id;

    const book = await strapi.db
      .query("api::book.book")
      .findOne({ where: { id } });

    if (!book) throw new Error("Book not found");

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId }, populate: { saved_books: true } });

    let newSavedBooks = user.saved_books || [];

    const isAlreadyFavorite =
      newSavedBooks.length > 0 &&
      newSavedBooks.filter((a) => a.id == id).length > 0;

    if (isAlreadyFavorite) {
      newSavedBooks = newSavedBooks.filter((a) => a.id != id);
    } else {
      newSavedBooks.push(id);
    }

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: { saved_books: newSavedBooks },
    });
    return { success: true };
  },
}));
