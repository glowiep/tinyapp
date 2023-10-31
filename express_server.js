const express = require("express");
const cookieParser = require("cookie-parser"); // Express middleware that facilitates working with cookies
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

// Import helper functions
const { generateRandomString, getUserByEmail, urlsForUser, checkUrlId } = require("./helperFunctions");

const urlDatabase = {   // The urlDatabase contain multiple 'urlID' objects, which contains the long url and the userID (cookie)
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// To store and access users
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user1@gmail.com",
    password: "test123",
  },
  oA10iQ: {
    id: "oA10iQ",
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
    // filter list in urlDatabase to show only the user's URLs
    urls: urlsForUser(req.cookies["user_id"], urlDatabase)
  };

  if (users[req.cookies["user_id"]]) {
    res.render("urls_index", templateVars);
  }
  res.status(403).send("Please <a href='http://localhost:8080/login'>log in</a> or <a href='http://localhost:8080/register'>register</a> to view your Shortened URLs list.\n");
});

// Create TinyURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"]
  };

  if (users[req.cookies["user_id"]]) {
    res.render("urls_new", templateVars);
  }
  // If not logged in, user will be redirected to /login page
  res.redirect("/login");
});

// TinyURL info page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.cookies["user_id"]
  };

  if (users[req.cookies["user_id"]] && checkUrlId(req.params.id, req.cookies["user_id"], urlDatabase)) {
    res.render("urls_show", templateVars);
  } else if (users[req.cookies["user_id"]] === undefined) {
    res.status(403).send("Please <a href='http://localhost:8080/login'>log in</a> or <a href='http://localhost:8080/register'>register</a> to view your TinyURL page.\n");
  }
  // When a logged in user tries to access the TinyURL info page which belongs to another user.
  res.status(403).send("Unauthorized request. You do not own this TinyURL.");
});

// Redirect to longURL. User does not need to be logged in.
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  res.status(404).send("The Short URL ID does not exist.\n");
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"]
  };

  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");  // Redirect logged in users to /urls page
  }
  res.render("urls_registration", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    users,
    user_id: req.cookies["user_id"]
  };
  
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");  // Redirect logged in users to /urls page
  } else {
    res.render("urls_login", templateVars);
  }
});

// POST handler to generate short URL id when longURL is submitted
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  if (!users[req.cookies["user_id"]]) {
    res.status(403).send("Please <a href='http://localhost:8080/login'>log in</a> or <a href='http://localhost:8080/register'>register</a> to generate shortened URLs.\n");
  } else if (!(longURL.includes("https://") || longURL.includes("http://"))) {
    urlDatabase[randomString] = { longURL: `https://${longURL}`, userID: req.cookies["user_id"]};
  } else {
    urlDatabase[randomString] = { longURL, userID: req.cookies["user_id"] };
  }
  res.redirect(`/urls/${randomString}`);
});

// POST handler for the delete function
app.post("/urls/:id/delete", (req, res) => {
  // check if the user has permission to delete the urlID
  if (checkUrlId(req.params.id, req.cookies["user_id"], urlDatabase)) {
    res.redirect("/urls");
    delete urlDatabase[req.params.id];
  }
  res.status(401).send("Unauthorized request. Please <a href='http://localhost:8080/login'>log in</a> to delete your URL.\n");
});

// POST handler to update existing URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.UpdatedLongURL;
  res.redirect("/urls");
});

// POST to login page
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (user !== null && user.password === password) {  // successful login
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else if (user !== null && user.password !== password) { // email is found but password does not match
    res.status(400).send("The password is incorrect. Please <a href='http://localhost:8080/login'>try again</a>.\n");
  } else if (user === null) { // email is not found
    res.status(404).send("The user with this email address is not found.\n");
  }
});

// Logout Endpoint that clears username cookie and redirects user back to /login page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// POST handler to handle registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();   // unique user id
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    return  res.status(400).send("The Email and Password field must not be empty.\n");
  }

  // Check if email already exists
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("An account with this email already exists.\n");
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);  // set a user_id cookie containing the user's newly generated ID
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});