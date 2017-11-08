const express = require('express');
const bodyParser = require("body-parser");

// Initialize express
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// default port 8080
const PORT = process.env.PORT || 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a string of 6 random alphanumeric characters
function generateRandomString() {
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

// Defining (registering) a HTTP GET request on /
// Along with a callback func that will handle the request
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// passing urlDatabase data to .views/urls_index.ejs
// list all short URL and it's full URL
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create a URL Submission Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Get post info from URL Submission Form
app.post("/urls", (req, res) => {
  // generate a 6 character short string
  const shortURL = generateRandomString();

  // add URL and shortURL to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);

  // Redirect to /urls and list urlDatabase
  res.redirect(`/urls`);
});

// Redirect short URLs to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Removes a URL resource from urlDatabase
// Redirects to /urls
app.post("/urls/:id/delete", (req, res) =>{
  //console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Passing request data to .view/urls_show.ejs
// List full URL by request short URL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

// Updates the URL after user click the `upadate` button
// Redirects to /urls
app.post("/urls/:id", (req, res) =>{
  console.log(req.params.id);
  console.log(req.body.longURL);
  let shortURL = req.params.id;
  let newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;

  console.log(urlDatabase);
  res.redirect('/urls');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});