const http         = require('http');
const express      = require('express');
const path         = require('path');
const favicon      = require('static-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const less         = require('less-middleware');
const clc          = require('cli-color');

const env = process.env.NODE_ENV || "development";

const port = process.env.PORT || 3030;

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

logger.token('colored-status', function(req, res) {
	if (res.statusCode < 300) return clc.green(res.statusCode);
	if (res.statusCode < 400) return clc.cyan(res.statusCode);
	if (res.statusCode < 500) return clc.red(res.statusCode);
	return clc.redBright(res.statusCode);
});
app.use(logger(':date[iso] :remote-addr :response-time :colored-status :method :url'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(cookieParser());

app.use(less(path.join(__dirname, 'public'), { force : env == 'development' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
http.createServer(app).listen(port);

console.log('Listening on http://localhost:' + port);
