const express = require('express');
const timestamp = require('unix-timestamp');
const router = express.Router();
const config = require('../../../config');
const dal = require('../../../dal/dal');

router.get('/count', (req, res, next) => {
  dal.execute(dal.sql.get.messagequeuecount, [], 'get messagequeue count', res, dal.onSuccess)
});

router.get('/', (req, res, next) => {
  dal.execute(dal.sql.get.messagequeues, [], 'get messagequeues', res, dal.onSuccess)
});

router.get('/page/:page/items/:items', (req, res, next) => {
  var page = (req.params.page - 1) * items;
  dal.execute(dal.sql.get.messagequeues, [page, req.params.items], 'get messagequeues', res, dal.onSuccess)
});

router.get('/key/:key/type/:type', (req, res, next) => {
  dal.execute(dal.sql.get.messagequeue,
    [
      req.params.key,
      req.params.type
    ], 'get message queue by key and type',
    res,
    dal.onSuccess
  )
});

router.get('/next/:type', (req, res, next) => {
  //Set the status to Started
  //Set start time to now
  //Increment attempts
  if (req.params.type) {
    dal.execute(dal.sql.get.messagequeuenext, [req.params.type], 'get next message queue by key', res,
      //Update the message in the queue now it has been assigned
      function (res, result) {
        if (result.length !== 0) {
          //Ensure the message has a kill date time set in the future
          var killdatetime = 0;
          if (result[0].ttl && result[0].ttl !== 0) {
            killdatetime = Math.round(timestamp.now()) + result[0].ttl + (result[0].delay / 1000);
          }
          else {
            killdatetime = Math.round(timestamp.now()) + 30;
          }
          dal.execute(dal.sql.put.messagequeue, [
            Math.round(timestamp.now()), //startdatetime,
            Math.round(timestamp.now()), //updateddatetime,
            "started", //status,
            result[0].attempts + 1, //attempts,
            "", //response
            0, //error code
            killdatetime, //Set the kill date time for this request date
            result[0].id], 'update message queue', res, function () {
              dal.execute(dal.sql.get.messagequeuebyId, [result[0].id], 'get message queue', res, dal.onSuccess)
            }
          )
        }
        else {
          res.status(200).json("{id: 0}");
        }
      }
    )
  }
  else {
    res.status(500).json({ message: "missing input field Type:" + req.params.type })
  }
});

router.get('/last/:key', (req, res, next) => {
  dal.execute(dal.sql.get.messagequeuelatestkey, [req.params.key], 'get last queue item for this key', res, dal.onSuccess);
})

router.post('/', (req, res, next) => {
  if (config.debug) console.log(req.body)
  if (req.body.key && req.body.type && req.body.message) {
    dal.execute(dal.sql.post.messagequeue, [req.body.key,
    req.body.type,
    req.body.message,
      0, //startdatetime,
    Math.round(timestamp.now()), //createddatetime,
      0, //updateddatetime,
      "new", //status,
      0, //attempts
      "", //response
      0, //error Code
    req.body.ttl, //Time to Live
      0, //Kill date set to zero so do not kill,
    req.body.delay,
    req.body.requestertoken
    ], 'create messagequeue', res, dal.onSuccess)
  }
  else {
    res.status(500).json({ message: "missing input field Key:" + req.body.key + " Type:" + req.body.type + " Message:" + req.body.message })
  }
});

router.put('/prune', (req, res, next) => {
  dal.execute(dal.sql.put.messagequeuereset, [], 'update message queue', res, function () {
    dal.execute(dal.sql.put.messagequeuekill, [], 'update message queue', res, dal.onSuccess)
  })
});

router.put('/:id', (req, res, next) => {
  dal.execute(dal.sql.put.messagequeueadmin,
    [
      req.body.status,
      req.body.attempts,
      req.params.id
    ],
    'update message queue', res, dal.onSuccess)
});

router.put('/:key/type/:type', (req, res, next) => {
  dal.execute(dal.sql.put.messagequeueworker, [
    Math.round(timestamp.now()), //updateddatetime,
    "complete", //status,
    req.body.response,
    req.body.errorcode,
    req.params.key,
    req.params.type
  ], 'update message queue', res, (res, result) => {
    console.log("Restart Job Completed with Errors");
    dal.execute(dal.sql.put.messagequeuerestart, [], res, dal.onSuccess)
  })
});

router.delete('/:id', (req, res, next) => {

  // You have delved to deep.  The Balrog has been unleashed 
  dal.execute(dal.sql.delete.messagequeue, [req.params.id], 'delete Messagequeue', res, dal.onSuccess)
});
module.exports = router;