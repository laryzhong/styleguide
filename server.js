const http    = require('http');
const express = require('express');
const path    = require('path');
const less    = require('less-middleware');

const env  = process.env.NODE_ENV || 'development';

const port = process.env.PORT || 3030;

const app  = express();

app.use(less(path.join(__dirname, 'public'), { force : env == 'development' }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	res.render('main');
});
app.get('/color-palette', function(req, res) {
	res.render('color-palette');
});
app.get('/typography', function(req, res) {
	res.render('typography');
});
app.get('/buttons', function(req, res) {
	res.render('buttons');
});
app.get('/branding', function (req, res) {
	res.render('branding');
});
app.get('/logo', function (req, res) {
	res.render('logo');
});
app.get('/blocks', function (req, res) {
	res.render('blocks');
});
app.get('/forms', function (req, res) {
	res.render('forms');
});
app.get('/illustrations', function (req, res) {
	res.render('illustrations');
});
app.get('/photography', function (req, res) {
	res.render('photography');
});


http.createServer(app).listen(port);

console.log(`Listening on http://localhost:${port}`);
