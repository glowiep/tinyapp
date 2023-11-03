const express = require("express");
// Express middleware that facilitates working with cookies
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");  // Store passwords securely with bcrypt

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: "session",
  secret: "duX&FHG:W+zrKf#_2c5/pB",

  //Cookie options
  maxAge: 24 * 60 * 60 * 1000  // 24 hrs
}));

// Import helper functions
const { generateRandomString, getUserByEmail, urlsForUser, checkUrlId, checkUrlIdExists } = require("./helpers");

const logInLink = `<a href='http://localhost:${PORT}/login'>log in</a>`;
const registerLink = `<a href='http://localhost:${PORT}/register'>register</a>`;

const urlDatabase = {   // The urlDatabase contain multiple 'urlID' objects, which contains the long url and the userID (used to set session cookie)
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
    password: bcrypt.hashSync("test123", 10),
  },
  oA10iQ: {
    id: "oA10iQ",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
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
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: userID,
    // filter list in urlDatabase to show only the user's URLs
    urls: urlsForUser(userID, urlDatabase)
  };

  if (users[userID]) {
    return res.render("urls_index", templateVars);
  }
  
  return res.status(403).send(`Please ${logInLink} or ${registerLink} to view your Shortened URLs list.\n`);
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
  const templateVars = {
    users,
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user_id: userID
  };
  
  // Render TinyURL info page if the user is logged in and owns that TinyURL
  if (users[userID] && checkUrlId(urlID, userID, urlDatabase)) {
    return res.render("urls_show", templateVars);
  }
  
  // User is not logged in
  if (users[userID] === undefined) {
    return res.status(403).send(`Please ${logInLink} or ${registerLink} to view your TinyURL page.\n`);
  }

  // When a logged in user tries to access the TinyURL info page which belongs to another user.
  return res.status(403).send("Unauthorized request. You do not own this TinyURL.");
});


// Redirect to longURL. User does not need to be logged in.
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (urlDatabase[urlID]) {
    const longURL = urlDatabase[urlID].longURL;
    res.redirect(longURL);
  }
  res.status(404).send("The TinyURL ID does not exist.\n");
});


// Register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    users,
    user_id: user
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
  
  // Redirect logged in users to /urls page
  if (users[userID]) {
    return res.redirect("/urls");
  }
  
  return res.render("urls_login", templateVars);
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


// POST handler for the delete function
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`Unauthorized request. Please ${logInLink} to delete your TinyURL.\n`);
  }
  
  // Check if urlID exists in the entire database
  if (!checkUrlIdExists(urlID, urlDatabase)) {
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


// POST handler to update existing URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`Unauthorized request. Please ${logInLink} to view or modify your TinyURL.\n`);
  }
  
  // Check if urlID exists in the entire database
  if (!checkUrlIdExists(urlID, urlDatabase)) {
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

  // Successful login
  if (user !== null && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
  
  // Email is found but password does not match
  if (user !== null && !bcrypt.compareSync(password, user.password)) {
    return res.status(400).send(`The password is incorrect. Please ${logInLink} and try again.\n`);
  }
  
  // Email is not found
  if (user === null) {
    return res.status(404).send(`The user with this email address is not found. Please ${registerLink} to log in.\n`);
  }
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
    return  res.status(400).send("The Email and Password field must not be empty.\n");
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
  
  // set a the session cookie as the user's newly generated ID
  req.session.user_id = id;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});