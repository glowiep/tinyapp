const express = require("express");
const cookieParser = require("cookie-parser"); // Express middleware that facilitates working with cookies
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

// Import helper functions
const { generateRandomString } = require("./helperFunctions");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// To store and access users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// My URLs landing page
app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"],
    urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// Create TinyURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

// TinyURL info page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

// Redirect to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_registration", templateVars);
});

// POST handler to generate short URL id when longURL is submitted
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  if (!(longURL.includes("https://") || longURL.includes("http://"))) {
    urlDatabase[randomString] = `https://${longURL}`;
  } else {
    urlDatabase[randomString] = longURL;
  }
  console.log(urlDatabase); // test
  res.redirect(`/urls/${randomString}`);
});

// POST handler for the delete function
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// POST handler to update existing URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.UpdatedLongURL;
  res.redirect("/urls");
});

// POST to login page
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Logout Endpoint that clears username cookie and redirects user back to /urls page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// POST handler to handle registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();   // unique user id
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (email === "" || password === "") {
     res.status(400).send("The Email and Password field must not be empty.")
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);          // set a user_id cookie containing the user's newly generated ID
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});