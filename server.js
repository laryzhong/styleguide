const http    = require('http');
const express = require('express');
const path    = require('path');
const less    = require('less-middleware');
const pageData = require('./data/index');

const env  = process.env.NODE_ENV || 'development';

const port = process.env.PORT || 3030;

const app  = express();

app.use(less(path.join(__dirname, 'public'), { force : env == 'development' }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

// render view path from index.js
pageData.forEach(objData => {
	const path = objData.content === 'main' ? '' : objData.content;
	app.get(`/${path}`, (req, res) => res.render(objData.content));
});

http.createServer(app).listen(port);

console.log(`Listening on http://localhost:${port}`);
