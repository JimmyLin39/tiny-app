const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Initialize express
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// set user_id as local variable that can send to all views
app.use((req, res, next) => {
  res.locals.user_id = req.cookies["user_id"];
  // pass entire `users` string Object to _header.ejs
  res.locals.users = users;
  // console.log("header:", res.locals.users);
  next();
});

app.set("view engine", "ejs");

// Default port 8080
const PORT = process.env.PORT || 8080;
// Store URL info
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Store user info
const users = [
  {
    user_id: "1",
    email: "amy@example.com",
    password: "amy"
  },
  {
    user_id: "2",
    email: "tom@example.com",
    password: "tom"
  }
]
// Find user in `users`
function findUser(email, password) {
  return users.find((user) => user.email === email && user.password === password);
}

// Find user by email
function findByEmail(email) {
  return users.find((user) => user.email === email);
}

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
  res.redirect("/urls");
});

// passing data to .views/urls_index.ejs
// list all short URL and it's full URL
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
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

  // Redirect to /urls and list urlDatabase
  res.redirect("/urls");
});

// Redirect short URLs to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Removes a URL resource from urlDatabase
// Redirects to /urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Passing request data to .view/urls_show.ejs
// List full URL by request short URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// Updates the URL after user click the `upadate` button
// Redirects to /urls
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let newLongURL = req.body.longURL;
  // Update urlDatabase
  urlDatabase[shortURL] = newLongURL;

  res.redirect("/urls");
});

// Go to Login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// A login form will sets cookies after submit
// Redirects to /
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const rightEmail = findByEmail(email);
  const user = findUser(email, password);
  // A user cannot log in with an incorrect email
  if ( !rightEmail ) {
    res.status(403).send("E-mail address cannot be found.");
  // A user cannot log in with an incorrect password
  } else if ( !user ) {
    res.status(403).send(`Password not match to ${email}`);
  } else {
    const user_id = user["user_id"];
    // set user_id to cookie
    res.cookie("user_id", user_id);
    res.redirect('/');
  }
});

// Log out and clear the user_id cookie
// Redirects to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Go to Registration page
// page includes a form with an email and password field
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// Add a new user object in the global `users` object
// Redirects to /urls
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email, password);
  // If the e-mail or password are empty strings
  if (!email || !password) {
    res.status(400).send('Please input email or password.');
  // If user already exist
  }else if ( user ) {
    res.status(400).send(`User ${email} already exist.`);
  } else {
    const id = generateRandomString();
    users.push({
      user_id: id,
      email: email,
      password: password
    });
    //console.log(users);
    res.cookie("user_id", id);

    res.redirect('/urls');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});