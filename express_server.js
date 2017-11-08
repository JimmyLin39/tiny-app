var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a string of 6 random alphanumeric characters
function generateRandomString() {
  var RandomString = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    RandomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // console.log(RandomString);
  return RandomString;
}

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
// list short form link and it's full url
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create a URL Submission Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// URL Submission Form debug
app.post("/u", (req, res) => {
  // debug statement to see POST parameters
  console.log(req.body);
  let shortForm = generateRandomString();

  // add URL and shortFrom to urlDatabase
  urlDatabase[shortForm] = req.body.longURL;
  console.log(urlDatabase);

  // Respond with a random string and it's longURL
  res.redirect(`/u/${shortForm}`);
  // res.send(`${shortForm}: ${urlDatabase[shortForm]}`);
});

// Redirect short URLs to longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

// passing request data to .view/urls_show.ejs
// list full url by request short form
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});