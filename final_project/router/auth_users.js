const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"dennis","password":"abc"}];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Perform authentication
  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

      // Set session information
      req.session.authorization = {
          accessToken,
          username
      };
      console.log("Session after setting:", req.session);
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(401).send("Invalid credentials");
  }
});


// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).send("Review successfully posted");
});

// Delete a review
regd_users.delete("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  let deletedReview = books[isbn].reviews[username];
  delete books[isbn].reviews[username];
  return res.status(200).send({"message": "Review successfully deleted", deletedReview: deletedReview});
});

module.exports = { authenticated: regd_users, isValid, users };
