const http         = require('http');
const express      = require('express');
const path         = require('path');
const favicon      = require('static-favicon');
const less         = require('less-middleware');

const env = process.env.NODE_ENV || 'development';

const port = process.env.PORT || 3030;

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(less(path.join(__dirname, 'public'), { force : env == 'development' }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'public', './views/main.html'));
});
http.createServer(app).listen(port);

console.log(`Listening on http://localhost:${port}`);
