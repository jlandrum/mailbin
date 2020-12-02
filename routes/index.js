const express = require('express')
const router = express.Router()

module.exports = function(app) {
  const s3 = app.get('s3');

  router.get('/', (req, res) => {
    s3.listObjects({
      Bucket: 'jlandrum-mailbin'
    }, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        res.render('index', {
          title: 'MailBin',
          files: data['Contents'].map((it) => it['Key'])
        })
      }
    });
  });

  router.get('/view/:file', (req, res) => {
    s3.getObject({
      Bucket: 'jlandrum-mailbin',
      Key: req.params.file
    }, function(err, data) {
      res.set({'Content-Type': 'text/plain'}).send(data.Body);
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

  return router;
}
