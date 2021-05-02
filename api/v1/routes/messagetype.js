const express = require('express');
const router = express.Router();
const config = require('../../../config');
const dal = require('../../../dal/dal');

router.get('/count', (req, res, next) => {
  dal.execute(dal.sql.get.messagetypecount, [], 'get messagetype count', res, dal.onSuccess)
});

router.get('/', (req, res, next) => {
  dal.execute(dal.sql.get.messagetypes, [], 'get messagetypes', res, dal.onSuccess)
});

router.get('/page/:page/items/:items', (req, res, next) => {
  var page = (req.params.page - 1) * items;
  dal.execute(dal.sql.get.messagetypes, [page, req.params.items], 'get messagetypes', res, dal.onSuccess)
});

router.get('/:id', (req, res, next) => {
  dal.execute(dal.sql.get.messagetype, [req.params.id], 'get messagetype', res, dal.onSuccess)
});




router.post('/', (req, res, next) => {
  dal.execute(dal.sql.post.messagetype, [req.body.name,
  req.body.ttlreq.body.attempts], 'create messagetype', res, dal.onSuccess)
});


router.put('/:id', (req, res, next) => {
  if (req.body.name || req.body.name != null || req.body.name != '') {
    dal.execute(dal.sql.put.messagetype, [req.body.name,
    req.body.ttl,
    req.body.attempts,
    req.params.id], 'update messagetype', res, dal.onSuccess)
  } else {
    res.status(501).json({ error: 'messagetype name must contain a value' })
  }
});


router.delete('/:id', (req, res, next) => {

  // You have delved to deep.  The Balrog has been unleashed 
  dal.execute(dal.sql.delete.messagetype, [req.params.id], 'delete Messagetype', res, dal.onSuccess)
});
module.exports = router;