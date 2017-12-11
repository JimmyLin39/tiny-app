const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// Initialize express
const app = express();

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  keys: ['pinkboat'],
}));

// set user_id as local variable that can send to all views
app.use((req, res, next) => {
  res.locals.user_id = req.session.user_id;
  // pass entire `users` string Object to _header.ejs
  res.locals.users = users;
  // console.log('header:', res.locals.users);
  next();
});

app.set('view engine', 'ejs');

// Default port 8080
const PORT = process.env.PORT || 8080;
// Store URL info
const urlDatabase = {
  'b2xVn2': {
    shortURL: 'b2xVn2',
    longURL: 'http://www.lighthouselabs.ca',
    userID: '1'
  },
  '9sm5xK': {
    shortURL: '9sm5xK',
    longURL: 'http://www.google.com',
    userID: '2'
  }
};

// Store user info
const users = {
  '1': {
    user_id: '1',
    email: 'amy@example.com',
    password: bcrypt.hashSync('amy', 10)
  },
  '2': {
    user_id: '2',
    email: 'tom@example.com',
    password: bcrypt.hashSync('tom', 10)
  }
};

// Find user in `users`
function findUser(email, password) {
  // console.log(email);
  for (let element in users){
    // console.log(users[element]);
    const hashedPassword = users[element].password;
    const rightPassword =  bcrypt.compareSync(password, hashedPassword);
    if ( users[element].email === email && rightPassword) {
      return true;
    }
  }
  return false;
}

// Find user by email
function findByEmail(email) {
  for (let element in users) {
    if ( users[element].email === email ) {
      return users[element].user_id;
    }
  }
  return false;
}

// Find shortURL by shortURL
function findShortUrlByShortUrl(shortURL) {
  if ( urlDatabase[shortURL] ) {
    return true;
  } else {
    return false;
  }
}

// Find shortURL by userID
function findShortUrlByID(shortURL, id) {
  if ( urlDatabase[shortURL].userID === id ) {
    return true;
  } else {
    return false;
  }
}

// generate a string of 6 random alphanumeric characters
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 6; i++){
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

// Defining (registering) a HTTP GET request on /
// Along with a callback func that will handle the request
app.get('/', (req, res) => {
  // if user is logged in (cookie exist)
  if ( req.session.user_id ) {
    res.redirect('/urls');
  // if user is not logged in
  } else {
    res.redirect('/login');
  }
});

// passing data to .views/urls_index.ejs
// list all short URL and it's full URL
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  // if user is not logged in
  if (!user_id ) {
    res.status(403).send('<h1>Please login.</h1>');
  } else {
    // set a temp value that can pass to urls_index
    const templateVars = {
      urls: []
    };
    // looking for user_id in urlDatabase
    for (let shortURL in urlDatabase) {
      // find userIDs in urlDatabase
      const userID = urlDatabase[shortURL].userID;
      // If user_id is userID
      // current user have right to see/edit/delete their short URL
      if (userID === user_id){
        templateVars.urls.push(urlDatabase[shortURL]) ;
      }
    }
    // console.log(urlDatabase);
    res.render('urls_index', templateVars);
  }
 });


// Create a new shortURL page
app.get('/urls/new', (req, res) => {
  // if user is not logged in, redirect to /login
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new');
  }
});

// Passing request data to .view/urls_show.ejs
// List full URL by request short URL
app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const user_id =  req.session.user_id;
  // if user is not logged in
  if (!user_id ) {
    res.status(403).send('<h1>Please login.</h1>');
  // if a URL for the given ID does not exist
  } else if ( !findShortUrlByShortUrl(shortURL) ) {
    res.status(403).send('<h1>This short URL not exist, please create a new one.</h1>');
  // if user is logged it but does not own the URL with the given ID
  } else if ( !findShortUrlByID(shortURL, user_id) ) {
    res.status(403).send('<h1>You did not own this short URL.</h1>');
  } else {
    const templateVars = {
      shortURL: shortURL,
      urls: urlDatabase[shortURL],
    };
    res.render('urls_show', templateVars);
  }
});

// Redirect short URLs to longURL
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if ( !findShortUrlByShortUrl(shortURL) ) {
    res.status(403).send('<h1>This short URL not exist, please contact owner.</h1>');
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

// Get post info from create a new shortURL page
app.post('/urls', (req, res) => {
  const user_id = req.session.user_id;
  // if user is not logged in
  if (!user_id) {
    res.status(403).send('<h1>Please login.</h1>');
  } else {
    // generate a 6 character short string
    const shortURL = generateRandomString();
    // add URL and shortURL to urlDatabase
    urlDatabase[shortURL] = {
      shortURL: shortURL,
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    // Redirect to /urls and list urlDatabase
    res.redirect(`/urls`);
  }
});

// Updates the URL after user click the `upadate` button
// Redirects to /urls
app.post('/urls/:id', (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  // if user is not logged in
  if (!user_id ) {
    res.status(403).send('<h1>Please login.</h1>');
  // if user is logged it but does not own the URL with the given ID
  } else if ( !findShortUrlByID(shortURL, user_id) ) {
    res.status(403).send('<h1>You did not own this short URL.</h1>');
  } else {
    const newLongURL = req.body.longURL;
    // Update urlDatabase
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  }
});

// Removes a URL resource from urlDatabase
// Redirects to /urls
app.post('/urls/:id/delete', (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  if (!user_id ) {
    res.status(403).send('<h1>Please login.</h1>');
  // if user is logged it but does not own the URL with the given ID
  } else if ( !findShortUrlByID(shortURL, user_id) ) {
    res.status(403).send('<h1>You did not own this short URL.</h1>');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

// Go to Login page
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  // if user is logged in
  if (user_id) {
    res.redirect('/urls')
  } else {
    res.render('urls_login');
  }
});

// Go to Registration page
// page includes a form with an email and password field
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  // if user is logged in
  if (user_id) {
    res.redirect('/urls')
  } else {
    res.render('urls_register');
  }
});

// A login form will sets cookies after submit
// Redirects to /
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // check email and Use bcrypt to check passwords
  const rightPassword = findUser(email, password);

  // A user cannot log in with an incorrect email or password
  if ( !rightPassword ) {
    res.status(403).send(`<h1>The email and password you entered did not match our records.</h1>`);
  } else {
    const user_id = findByEmail(email);
    // set the user_id key on a session then pass to cookie
    req.session.user_id = user_id;
    res.redirect('/');
  }
});

// Add a new user object in the global `users` object
// Set user_id to cookie
// Redirects to /urls
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const userExist = findByEmail(email);
  // If the e-mail or password are empty strings
  if (!email || !password) {
    res.status(400).send('<h1>Please input email or password.</h1>');
  // If user already exist
  }else if ( userExist ) {
    res.status(400).send(`<h1>User ${email} already exist.</h1>`);
  } else {
    const id = generateRandomString();
    // apply bcrypt to the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // console.log(hashedPassword);
    users[id] = {
      user_id: id,
      email: email,
      password: hashedPassword
    };
    // console.log(users);
    // set the user_id key on a session then pass to cookie
    req.session.user_id = id;

    res.redirect('/urls');
  }
});

// Log out and clear the session cookie
// Redirects to /urls
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});