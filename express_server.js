const express = require("express");
const methodOverride = require("method-override");  // Middleware to allow usage of HTTP verbs such as PUT or DELETE

const cookieSession = require("cookie-session");  // Express middleware that facilitates working with cookies
const bcrypt = require("bcryptjs");  // Store passwords securely

// Import constants
const { PORT, logInLink, registerLink, urlDatabase, users } = require("./constants");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: "session",
  secret: "duX&FHG:W+zrKf#_2c5/pB",
  maxAge: 24 * 60 * 60 * 1000  // 24 hrs
}));

// Import helper functions
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  checkUrlId } = require("./helpers");

app.get("/", (req, res) => {
  const userID = req.session.user_id;

  // Redirect to /urls if user is logged in
  if (users[userID]) {
    return res.redirect("/urls");
  }

  // If not logged in, user will be redirected to /login page
  return res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// My URLs landing page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: userID,
    // filter urlDatabase to show only a copy of the database relevant to the userID
    urls: urlsForUser(userID, urlDatabase)
  };

  if (users[userID]) {
    return res.render("urls_index", templateVars);
  }
  
  return res.status(403).send(`Please ${logInLink} or ${registerLink} to view your TinyURLs list.\n`);
});


// Create TinyURL page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: userID
  };

  // Render page if the user exists in the database
  if (users[userID]) {
    return res.render("urls_new", templateVars);
  }

  // If not logged in, user will be redirected to /login page
  return res.redirect("/login");
});


// TinyURL info page
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  // Check if urlID exists in the entire database
  if (!urlDatabase[urlID]) {
    return res.status(404).send("This TinyURL does not exist.\n");
  }
  
  const templateVars = {
    users,
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user_id: userID
  };

  // User is not logged in
  if (!users[userID]) {
    return res.status(403).send(`Please ${logInLink} or ${registerLink} to view your TinyURL page.\n`);
  }

  // When a logged in user tries to access the TinyURL info page which belongs to another user.
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(403).send("Unauthorized request. You do not own this TinyURL.");
  }
  
  // Happy path - Render TinyURL info page if the user is logged in and owns the TinyURL
  return res.render("urls_show", templateVars);
});


// Redirect to longURL. User does not need to be logged in.
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (urlDatabase[urlID]) {
    const longURL = urlDatabase[urlID].longURL;
    return res.redirect(longURL);
  }
  return res.status(404).send("The TinyURL ID does not exist.\n");
});


// Register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: userID
  };

  // Redirect logged in users to /urls page
  if (users[userID]) {
    return res.redirect("/urls");
  }
  
  return res.render("urls_registration", templateVars);
});


// Login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: userID
  };
  
  if (!users[userID]) {
    return res.render("urls_login", templateVars);
  }

  // Redirect logged in users to /urls page
  return res.redirect("/urls");
});


// POST handler to generate short URL id when longURL is submitted
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const randomString = generateRandomString();
  const longURL = req.body.longURL;

  // Send error message to users that are not logged in
  if (!users[userID]) {
    return res.status(403).send(`Please ${logInLink} or ${registerLink} to generate shortened URLs.\n`);
  }
  
  // Ensure that URLs are stored with the correct protocol
  if (!(longURL.includes("https://") || longURL.includes("http://"))) {
    urlDatabase[randomString] = { longURL: `https://${longURL}`, userID};
  } else {
    urlDatabase[randomString] = { longURL, userID };
  }

  return res.redirect(`/urls/${randomString}`);
});


// DELETE handler for the delete function
app.delete("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`Unauthorized request. Please ${logInLink} to delete your TinyURL.\n`);
  }
  
  // Check if urlID exists in the entire database
  if (!urlDatabase[urlID]) {
    return res.status(404).send("This TinyURL does not exist.\n");
  }

  // Check if the user has permission to delete the urlID
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(401).send("Unauthorized request. This user does not own the TinyURL.\n");
  }
  
  // Happy path - User is logged in, owns the url, and the urlID exists in the database
  delete urlDatabase[urlID];
  return res.redirect("/urls");
});


// PUT handler to update existing URL
app.put("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`Unauthorized request. Please ${logInLink} to view or modify your TinyURL.\n`);
  }
  
  // Check if urlID exists in the entire database
  if (!urlDatabase[urlID]) {
    return res.status(404).send("This TinyURL does not exist.\n");
  }

  // Check if the user has permission to modify the urlID
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(401).send("Unauthorized request. This user does not own the TinyURL.\n");
  }
  
  // Happy path - User is logged in, owns the url, and the urlID exists in the database
  urlDatabase[urlID].longURL = req.body.UpdatedLongURL;
  return res.redirect("/urls");
});


// POST to login page
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    return  res.status(400).send(`The Email and Password fields must not be empty. Try to ${logInLink} again.\n`);
  }

  // Email is not found
  if (user === null) {
    return res.status(404).send(`The user with this email address is not found. Please ${registerLink} to log in.\n`);
  }
  
  // Happy path - successful login
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
  
  // Email is found but password does not match
  return res.status(400).send(`The password is incorrect. Please ${logInLink} and try again.\n`);
});


// Logout Endpoint that clears session cookie and redirects user back to /login page
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});


// POST handler to handle registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();   // unique user id
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    return  res.status(400).send(`The Email and Password field must not be empty. Try to ${registerLink} again.\n`);
  }

  // Check if email already exists
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("An account with this email already exists.\n");
  }

  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  
  // Set a the session cookie as the user's newly generated ID
  req.session.user_id = id;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});