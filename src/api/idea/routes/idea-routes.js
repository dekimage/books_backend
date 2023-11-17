module.exports = {
  routes: [
    {
      method: "POST",
      path: "/idea/createIdea",
      handler: "idea.createIdea",
    },
    {
      method: "PUT",
      path: "/idea/updateIdea",
      handler: "idea.updateIdea",
    },
    {
      method: "PUT",
      path: "/idea/deleteIdea",
      handler: "idea.deleteIdea",
    },
    {
      method: "PUT",
      path: "/idea/favoriteIdea",
      handler: "idea.favoriteIdea",
    },
    {
      method: "PUT",
      path: "/idea/reportIdea",
      handler: "idea.reportIdea",
    },
    {
      method: "GET",
      path: "/idea/getAllMyIdeas",
      handler: "idea.getAllMyIdeas",
    },
    {
      method: "GET",
      path: "/idea/getAllFavoriteIdeas",
      handler: "idea.getAllFavoriteIdeas",
    },
    {
      method: "GET",
      path: "/idea/getBookIdeas",
      handler: "idea.getBookIdeas",
    },
    {
      method: "GET",
      path: "/idea/getBookFavorites",
      handler: "idea.getBookFavorites",
    },
  ],
};
