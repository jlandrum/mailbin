const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const AWS = require('aws-sdk');
const SMTPServer = require('smtp-server').SMTPServer;
const EmlParser = require('eml-parser');
const querystring = require('querystring');

const indexRouter = require('./routes/index');

// Spaces
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
});
app.set('s3', s3);

// SMTP Server
const smtp = new SMTPServer({
  authOptional: true,
  onData(stream, session, callback) {
    const filename = `${Date.now()}.eml`;
    console.log(`New mail: creating mail document: ${filename}`);

    stream.on('end', callback);
    ((stream) => {
      let data = ""
      return new Promise((resolve, reject) => {
        stream.on('data', chunk => data += chunk);
        stream.on('error', reject);
        stream.on('end', () => resolve(data))
      });
    })(stream).then((data) => {
      new EmlParser(data)
        .parseEml()
        .then(result => {
          const from = result.from.value.map(it => `"${it.name}" <${it.address}>`).join(',')
          const to = result.to.value.map(it => `"${it.name}" <${it.address}>`).join(',')
          const subject = result.subject
	  const date = result.date
          s3.putObject({
            Bucket: 'jlandrum-mailbin',
            Key: filename,
            Body: data,
            Metadata: {from, to, subject, date},
          }, (err, data) => {})
      })
    });


  },
  onAuth(auth, session, callback) {
    console.log("Login attempt");
    if (auth.username !== "abc" || auth.password !== "def") {
      return callback(new Error("Invalid username or password"));
    }
    return callback(null, { user: 123 }); // where 123 is the user id or similar property
  }
});
smtp.listen(465);
app.set('smtp', smtp);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))

app.use('/', indexRouter(app));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
