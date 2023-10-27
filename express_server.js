const express = require("express");
const cookieParser = require("cookie-parser"); // Express middleware that facilitates working with cookies
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

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
    username: req.cookies["username"],
    urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// Create TinyURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// TinyURL info page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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
    username: req.cookies["username"]
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
  res.cookie('username', username);
  res.redirect("/urls");
});

// Logout Endpoint that clears username cookie and redirects user back to /urls page
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

// POST handler to handle registration form data
app.post("/register", (req, res) => {
  // unique user id
  const id = generateRandomString();
  const { email, password } = req.body;
  users[id] = {
    id,
    email,
    password
  };
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Returns a string of 6 random alphanumeric characters
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let count = 0; count < 6; count++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}