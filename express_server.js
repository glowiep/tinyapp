const express = require("express");
const urlRoutes = require("./routes/urls");
const methodOverride = require("method-override");  // Middleware to allow usage of HTTP verbs such as PUT or DELETE
const cookieSession = require("cookie-session");  // Express middleware that facilitates working with cookies
const bcrypt = require("bcryptjs");  // Store passwords securely

// Import constants
const {
  PORT,
  urlDoesNotExistMsg,
  emptyFieldsLoginMsg,
  emptyFieldsRegisterMsg,
  invalidEmailMsg,
  invalidPasswordMsg,
  emailExistsMsg } = require("./constants");

// Import databases
const { urlDatabase, users } = require("./databases")
  
// Import helper functions
const {
  generateRandomString,
  getUserByEmail,
  getUniqueVisitorCount } = require("./helpers");
    
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: "session",
  secret: "duX&FHG:W+zrKf#_2c5/pB",
  maxAge: 24 * 60 * 60 * 1000  // 24 hrs
}));

// Mount the router in the main Express application
app.use('/urls', urlRoutes);


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


// GET /u/:id - Redirect to longURL (User does not need to be logged in)
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  const urlIDObject = urlDatabase[urlID];

  // Check if urlID exists
  if (!urlIDObject) {
    return res.status(404).send(`${urlDoesNotExistMsg}`);
  }

  const longURL = urlDatabase[urlID].longURL;
  const newVisitorID = generateRandomString();
  const currentTime = new Date().toString();

  if (!req.session.isNew && req.session.visitorID) {
    urlIDObject.totalVisits += 1;
    urlIDObject.visitorID.push([req.session.visitorID, currentTime]);
    urlIDObject.uniqueVisits = getUniqueVisitorCount(urlIDObject.visitorID);
    return res.redirect(longURL);
  }

  // Happy path - new unique visitor
  req.session.visitorID = newVisitorID;
  urlIDObject.totalVisits += 1;
  urlIDObject.visitorID.push([req.session.visitorID, currentTime]);
  urlIDObject.uniqueVisits = getUniqueVisitorCount(urlIDObject.visitorID);
  return res.redirect(longURL);
});


// GET /register - Register page
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


// GET /login
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


// POST /login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    return  res.status(400).send(`${emptyFieldsLoginMsg}`);
  }

  // Email is not found
  if (user === null) {
    return res.status(404).send(`${invalidEmailMsg}`);
  }
  
  // Happy path - successful login
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
  
  // Email is found but password does not match
  return res.status(400).send(`${invalidPasswordMsg}`);
});


// POST /logout - clears session cookie and redirects user back to /login page
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});


// POST /register - handle submitted registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString();   // unique user id
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    return  res.status(400).send(`${emptyFieldsRegisterMsg}`);
  }

  // Check if email already exists
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send(`${emailExistsMsg}`);
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