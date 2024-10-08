const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(session({
    secret: "fingerprint_customer", // Change this to a secure key
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    console.log("Session: ", req.session); // Add this log for debugging
    if (req.session.authorization) {
        let token = req.session.authorization["accessToken"];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated." });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in." });
    }
});


app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
