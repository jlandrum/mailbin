const express = require('express')
const router = express.Router()
const EmlParser = require('eml-parser')
const querystring = require('querystring');

module.exports = function(app) {
  const s3 = app.get('s3');

  const index = (req, res) => {
    s3.listObjectsV2({
      Bucket: 'jlandrum-mailbin'
    }, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        Promise.all(data.Contents.map(
          item => new Promise((resolve, reject) => {
            s3.getObject({ Bucket: 'jlandrum-mailbin', Key: item.Key },
              (err, data) => {
                resolve({
                  key: item.Key,
                  subject: querystring.unescape(data.Metadata && data.Metadata.subject || ''),
                  from: data.Metadata && data.Metadata.from || '',
                  to: data.Metadata && data.Metadata.to || ''
                })
              });
          }))).then((data) => {
          res.render('index', {
            title: 'MailBin',
            files: data,
          })
        });
      }
    });
  }

  router.get('/', (req, res) => {
    if (req.query.deleteEmail) {
      s3.deleteObject({
        Bucket: 'jlandrum-mailbin',
        Key: req.query.deleteEmail
      }, (err, data) => {
        index(req, res);
      })
    } else {
      index(req, res);
    }
  });

  router.get('/view/:file', (req, res) => {
    s3.getObject({
      Bucket: 'jlandrum-mailbin',
      Key: req.params.file
    }, function(err, data) {
      new EmlParser(data.Body)
        .parseEml()
        .then(result => {
          res.render('mail', { mail: result, file: req.params.file, inline: req.query.inline !== undefined});
        })
        .catch(err => {
          res.render('mail', { error: err });
      })
    });
  })

  router.get('/download/:file', (req, res) => {
    s3.getObject({
      Bucket: 'jlandrum-mailbin',
      Key: req.params.file
    }, function(err, data) {
      res.send(data.Body);
    });
  })

  router.get('/rendermail/:file', (req, res) => {
    s3.getObject({
      Bucket: 'jlandrum-mailbin',
      Key: req.params.file
    }, function(err, data) {
      new EmlParser(data.Body)
      .parseEml()
      .then(result => {
        res.set({'Content-Type': 'text/html'}).send(result.html || result.textAsHtml);
      })
      .catch(err => {
        res.render('mail', { error: err });
      })

    });
  })

  return router;
}
