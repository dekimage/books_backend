module.exports = {
  routes: [
    { method: "GET", path: "/book/getUser", handler: "book.getUser" },
    {
      method: "PUT",
      path: "/book/favoriteBook",
      handler: "book.favoriteBook",
    },
    {
      method: "GET",
      path: "/book/getMyFavoriteBooks",
      handler: "book.getMyFavoriteBooks",
    },
  ],
};
