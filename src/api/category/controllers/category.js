"use strict";

/**
 * category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async followCategory(ctx) {
      const { id: categoryId } = ctx.request.body;
      const userId = ctx.state.user.id;

      // Find the category by ID to ensure it exists
      const category = await strapi.db
        .query("api::category.category")
        .findOne({ where: { id: categoryId } });

      if (!category) throw new Error("Category not found");

      // Find the user and populate the followCategories relationship
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId }, populate: { interests: true } });

      // Extract the IDs of categories the user currently follows
      let followedCategories = user.interests.map((cat) => cat.id);

      // Determine if the category is already followed
      const isAlreadyFollowing = followedCategories.includes(categoryId);

      if (isAlreadyFollowing) {
        // Unfollow the category by filtering it out
        followedCategories = followedCategories.filter(
          (id) => id !== categoryId
        );
      } else {
        // Follow the category by adding its ID
        followedCategories.push(categoryId);
      }

      // Update the user's interests relationship
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: userId },
        data: { interests: followedCategories },
      });

      return { success: true };
    },
  })
);
