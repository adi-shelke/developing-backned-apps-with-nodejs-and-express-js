const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing" });
  }

  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list
public_users.get("/", async (req, res) => {
  try {
    // Simulate an asynchronous operation (like fetching data)
    const fetchedBooks = await new Promise((resolve) => {
      resolve(books);
    });
    
    // Send the fetched books as a JSON response
    res.json(fetchedBooks);
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Create a new Promise to handle the asynchronous operation
  new Promise((resolve, reject) => {
    // Check if the book exists
    if (books[isbn]) {
      resolve(books[isbn]); // Resolve with the book data
    } else {
      reject(new Error("Book not found")); // Reject with an error if the book is not found
    }
  })
    .then((book) => {
      // If the promise is resolved, send the book data
      res.json(book);
    })
    .catch((err) => {
      // If the promise is rejected, send the error message
      res.status(404).json({ message: err.message });
    });
});


// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const { author } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.author === author);

  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get book details based on title
public_users.get("/title/:title", (req, res) => {
  const { title } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.title === title);

  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get("/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (books[isbn]) {
    return res.json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports = { general: public_users };
