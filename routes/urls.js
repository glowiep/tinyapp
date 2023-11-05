const express = require("express");
const router = express.Router();

// Import constants
const {
  logInPrompt,
  logInRegisterPrompt,
  
  urlDoesNotExistMsg,
  doesNotOwnURLMsg,
  unauthorizedDeleteMsg,
  unauthorizedUpdateMsg,

  urlDatabase,
  users } = require("../constants");

// Import helper functions
const {
  generateRandomString,
  urlsForUser,
  checkUrlId } = require("../helpers");


// GET /urls - My URLs landing page
router.get("/", (req, res) => {
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
  
  return res.status(403).send(`${logInPrompt}`);
});


// POST /urls - Generate short URL id when longURL is submitted
router.post("/", (req, res) => {
  const userID = req.session.user_id;
  const randomString = generateRandomString();
  let longURL = req.body.longURL;

  // Send error message to users that are not logged in
  if (!users[userID]) {
    return res.status(403).send(`${unauthorizedUpdateMsg}`);
  }

  // Does not create a new TinyURL when no longURL is entered
  if (longURL === "") {
    return res.redirect("/urls/new");
  }
  
  // Ensure the long URL is stored with the correct protocol
  if (!(longURL.includes("https://") || longURL.includes("http://"))) {
    longURL = `https://${longURL}`;
  }

  // Happy path - Save TinyURL to database and redirect to /urls/:id page
  urlDatabase[randomString] = {
    longURL,
    userID,
    visitorID: [],
    totalVisits: 0,
    uniqueVisits: 0
  };
  
  return res.redirect(`/urls/${randomString}`);
});


// GET /urls/new - Create TinyURL page
router.get("/new", (req, res) => {
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
    

// GET /urls/:id - TinyURL info page
router.get("/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  const urlIDObject = urlDatabase[urlID];
  // Check if urlID exists in the entire database
  if (!urlIDObject) {
    return res.status(404).send(`${urlDoesNotExistMsg}`);
  }
  
  const templateVars = {
    users,
    id: urlID,
    longURL: urlIDObject.longURL,
    user_id: userID,
    visitorID:  urlIDObject.visitorID,
    totalVisits: urlIDObject.totalVisits,
    uniqueVisits: urlIDObject.uniqueVisits,
  };

  // User is not logged in
  if (!users[userID]) {
    return res.status(403).send(`${logInRegisterPrompt}`);
  }

  // When a logged in user tries to access the TinyURL info page which belongs to another user.
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(403).send(`${doesNotOwnURLMsg}`);
  }
  
  // Happy path - Render TinyURL info page if the user is logged in and owns the TinyURL
  return res.render("urls_show", templateVars);
});


// PUT /urls/:id - Update existing URL (This does not reset the visitor Analytics)
router.put("/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;
  let newlongURL = req.body.UpdatedLongURL;
  
  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`${unauthorizedUpdateMsg}`);
  }
    
  // Check if urlID exists in the entire database
  if (!urlDatabase[urlID]) {
    return res.status(404).send(`${urlDoesNotExistMsg}`);
  }
  
  // Check if the user has permission to modify the urlID
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(401).send(`${doesNotOwnURLMsg}`);
  }
    
  // Ensure the long URL is stored with the correct protocol
  if (!(newlongURL.includes("https://") || newlongURL.includes("http://"))) {
    newlongURL = `https://${newlongURL}`;
  }
  
  // Happy path - User is logged in, owns the url, and the urlID exists in the database
  urlDatabase[urlID].longURL = newlongURL;
  return res.redirect("/urls");
});


// DELETE urls/:id
router.delete("/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {  // if the user is not logged in
    return res.status(401).send(`${unauthorizedDeleteMsg}`);
  }
  
  // Check if urlID exists in the entire database
  if (!urlDatabase[urlID]) {
    return res.status(404).send(`${urlDoesNotExistMsg}`);
  }

  // Check if the user has permission to delete the urlID
  if (!checkUrlId(urlID, userID, urlDatabase)) {
    return res.status(401).send(`${doesNotOwnURLMsg}`);
  }
  
  // Happy path - User is logged in, owns the url, and the urlID exists in the database
  delete urlDatabase[urlID];
  return res.redirect("/urls");
});

module.exports = router;