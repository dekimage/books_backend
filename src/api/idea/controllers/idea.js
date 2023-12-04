"use strict";

/**
 * idea controller
 */

const getOnlyBasicUserInfo = (array) =>
  array.map((a) => ({
    username: a.username,
    avatar: a.avatar,
  }));

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::idea.idea", ({ strapi }) => ({
  async createIdea(ctx) {
    const { data } = ctx.request.body;
    const { id } = ctx.state.user;

    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { book: data.book, creator: id } });

    if (idea) ctx.throw(400, "You already have an idea for this book!");

    const newIdea = await strapi.db
      .query("api::idea.idea")
      .create({ data: { ...data, creator: id } });
    return newIdea;
  },

  async updateIdea(ctx) {
    const { id, data } = ctx.request.body;
    const userId = ctx.state.user.id;

    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { id, creator: userId } });

    if (!idea) throw new Error("Idea not found");

    if (data.favorites) {
      return ctx.throw(400, "You can't update favorites!");
    }

    await strapi.db
      .query("api::idea.idea")
      .update({ where: { id, creator: userId }, data });
    return { success: true };
  },

  async deleteIdea(ctx) {
    const { id } = ctx.request.body;
    const userId = ctx.state.user.id;

    console.log(id);

    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { id, creator: userId } });

    if (!idea) throw new Error("Idea not found");

    await strapi.db.query("api::idea.idea").delete({ where: { id } });
    return { success: true };
  },

  async likeIdea(ctx) {
    const { id } = ctx.request.body;
    const userId = ctx.state.user.id;

    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { id } });

    if (!idea) throw new Error("Idea not found");

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId }, populate: { liked_ideas: true } });

    let newLikedIdeas = user.liked_ideas || [];

    const isAlreadyLiked =
      newLikedIdeas.length > 0 &&
      newLikedIdeas.filter((a) => a.id == id).length > 0;

    if (isAlreadyLiked) {
      newLikedIdeas = newLikedIdeas.filter((a) => a.id != id);
    } else {
      newLikedIdeas.push(id);
    }

    await strapi.db.query("api::idea.idea").update({
      where: { id },
      data: {
        likesCount: isAlreadyLiked ? idea.likesCount - 1 : idea.likesCount + 1,
      },
    });

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: { liked_ideas: newLikedIdeas },
    });
    return { success: true };
  },

  async saveIdea(ctx) {
    const { id } = ctx.request.body;
    const userId = ctx.state.user.id;

    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { id } });

    if (!idea) throw new Error("Idea not found");

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId }, populate: { saved_ideas: true } });

    let newSavedIdeas = user.saved_ideas || [];

    const isAlreadyFavorite =
      newSavedIdeas.length > 0 &&
      newSavedIdeas.filter((a) => a.id == id).length > 0;

    if (isAlreadyFavorite) {
      newSavedIdeas = newSavedIdeas.filter((a) => a.id != id);
    } else {
      newSavedIdeas.push(id);
    }

    await strapi.db.query("api::idea.idea").update({
      where: { id },
      data: {
        savesCount: isAlreadyFavorite
          ? idea.savesCount - 1
          : idea.savesCount + 1,
      },
    });

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: { saved_ideas: newSavedIdeas },
    });
    return { success: true };
  },

  async reportIdea(ctx) {
    const { id } = ctx.request.body;
    const userId = ctx.state.user.id;
    const idea = await strapi.db
      .query("api::idea.idea")
      .findOne({ where: { id } });

    await strapi.db.query("api::idea.idea").update({
      where: { id },
      data: {
        reports: idea.reports + 1,
      },
    });
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: {
        reports: {
          ...ctx.state.user.reports,
          ideas: ctx.state.user.reports.ideas + 1,
        },
      },
    });
  },

  async getAllMyIdeas(ctx) {
    const { id } = ctx.state.user;

    const ideas = await strapi.db.query("api::idea.idea").findMany({
      where: { creator: id },

      populate: {
        book: { populate: { image: true } },
        creator: { populate: { avatar: true } },
      },
    });
    return ideas;
  },

  async getAllSavedIdeas(ctx) {
    const { id } = ctx.state.user;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id }, populate: { saved_ideas: true } });

    return user.saved_ideas || [];
  },

  async getBookIdeas(ctx) {
    const { bookId } = ctx.query;
    const user = ctx.state.user;

    const idea = await strapi.db.query("api::idea.idea").findOne({
      where: { creator: user.id, book: bookId },
      populate: { book: { populate: { image: true } } },
    });

    if (idea) {
      return {
        ...idea,
        creator: {
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      };
    } else {
      return null;
    }
  },

  async getBookFavorites(ctx) {
    const { bookId } = ctx.query;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: ctx.state.user.id },
        populate: { saved_ideas: { populate: { book: true } } },
      });

    if (user.saved_ideas.length == 0) {
      return [];
    }

    const ideasIds = user.saved_ideas
      .filter((idea) => idea.book.id == bookId)
      .map((idea) => idea.id);

    const ideas = await strapi.db.query("api::idea.idea").findMany({
      where: { id: { $in: ideasIds } },
      populate: {
        creator: { avatar: true },
        book: { populate: { image: true } },
      },
    });

    return ideas.map((idea) => ({
      ...idea,
      creator: {
        username: idea.creator?.username,
        bio: idea.creator?.bio,
        createdAt: idea.creator?.createdAt,
        avatar: idea.creator?.avatar,
      },
    }));
  },
}));
