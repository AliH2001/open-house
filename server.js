require('dotenv').config()
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');
const isSignedIn = require('./middleware/is-signed-in');
const passUserToView = require('./middleware/pass-user-to-view');

const port = process.env.PORT || '3000';

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 7 * 24 * 60 * 60, // 1 week in seconds
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    httpOnly: true,
    secure: false,
  },
}));

app.use(passUserToView);

const pagesCtrl = require('./controllers/pages');
const authCtrl = require('./controllers/auth');
const vipCtrl = require('./controllers/vip');
const listingsCtrl = require('./controllers/listings')

app.get('/', pagesCtrl.home);
app.get('/auth/sign-up', authCtrl.signUp);
app.post('/auth/sign-up', authCtrl.addUser);
app.get('/auth/sign-in', authCtrl.signInForm);
app.post('/auth/sign-in', authCtrl.signIn);
app.get('/auth/sign-out', authCtrl.signOut); // added this route
app.get('/vip-lounge', isSignedIn, vipCtrl.welcome); // vip lounge

app.use(isSignedIn) // middleware to check if user is signed in

app.get('/listings/index',listingsCtrl.index); // list all listings
app.get('/listings/new',  listingsCtrl.newListing); // new listing
app.post('/listings',listingsCtrl.createListing)

app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal server error');
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}`);
})
