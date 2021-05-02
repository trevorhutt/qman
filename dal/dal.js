const mysql = require('mysql')
const config = require('../config')

module.exports.connection = function () {

   return mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port
   })
}

module.exports.onSuccess = function (res, result) {
   //console.log(JSON.stringify(res));
   res.status(200).json(result);
}

module.exports.execute = function (statement, params, action, res, next) {
   const connection = this.connection()
   if (config.debug) console.log(action + ' of: ' + JSON.stringify(params))
   connection.connect(function (error) {
      if (error) {
         console.log(error)
      }
      else {
         if (config.debug) console.log(statement + ' : ' + JSON.stringify(params))
         connection.query(statement, params, function (error, result, fields) {
            if (error) {
               if (config.debug) console.log(JSON.stringify(error))
               res.status(500).json({ error: error })
            }
            else if (result) {
               return next(res, result)
            }
         })
         connection.end()
      }
   })
}

module.exports.sql = {
   get: {
      messagequeue: "select `id`, `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `deleted`, `delay`, `requestertoken`, `timestamp` from `messagequeue` where deleted = 0 and `key` = ? and `type` = ?",
      messagequeuebyId: "select `id`, `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `deleted`, `delay`, `requestertoken`, `timestamp` from `messagequeue` where deleted = 0 and `id` = ?",
      messagequeues: "select `id`, `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `deleted`, `delay`, `requestertoken`, `timestamp` from `messagequeue` where deleted = 0",
      messagequeuespage: "select `id`, `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `deleted`, `delay`, `requestertoken`, `timestamp` from `messagequeue` where `deleted` = 0 LIMIT ? OFFSET ?",
      messagequeuecount: "select count(id) as messagequeuecount from messagequeue where deleted = 0",
      messagequeuenext: "select `messagequeue`.`id`, `messagequeue`.`key`, `messagequeue`.`message`, `messagequeue`.`startdatetime`, " +
      "`messagequeue`.`createddatetime`, `messagequeue`.`updateddatetime`, `messagequeue`.`status`, `messagequeue`.`attempts`, `messagequeue`.`response`, " +
      "`messagequeue`.`errorcode`, `messagequeue`.`deleted`, `messagequeue`.`delay`, `messagequeue`.`requestertoken`, `timestamp` " +
      "from `messagequeue` " + 
      "join `messagetype` on `messagetype`.`name` = `messagequeue`.`type` and " +
      "`messagetype`.`attempts` >= `messagequeue`.`attempts` " + 
      "where `deleted` = 0 and `messagequeue`.`status` = 'new' and " + 
      "`messagequeue`.`type` = ? and (unix_timestamp() >= (`createddatetime` + (`delay`/1000))) or (`messagequeue`.`errorcode` >= 400) " +
      "LIMIT 1",
      messagequeuelatestkey: "select `id`, `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `deleted`, `delay`, `requestertoken`, `timestamp` from `messagequeue` where deleted = 0 and `status` IN ('new','started','complete','dead') and `key` = ? ORDER BY `startdatetime` DESC LIMIT 1",
      messagetype: "select `id`, `name`, `ttl`, `attempts`, `limit` from `messagetype` where deleted = 0 and id = ?",
      messagetypes: "select `id`, `name`, `ttl`, `attempts`, `limit` from `messagetype` where deleted = 0",
      messagetypespage: "select `id`, `name`, `ttl`, `attempts`, `limit` from `messagetype` where `deleted` = 0 LIMIT ? OFFSET ?",
      messagetypecount: "select count(id) as messagetypecount from messagetype where deleted = 0",
   },
   post: {
      messagequeue: "insert into `messagequeue` ( `key`, `type`, `message`, `startdatetime`, `createddatetime`, `updateddatetime`, `status`, `attempts`, `response`, `errorcode`, `ttl`, `killdatetime`, `delay`, `requestertoken`)  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      messagetype: "insert into `messagetype` ( `name`, `ttl`, `attempts`, `limit`)  values (?, ?, ?, ?)"
   },
   put: {
      messagequeue: "update `messagequeue` set  `startdatetime` = ?, `updateddatetime` = ?, `status` = ?, `attempts` = ?, `response` = ?, `errorcode` = ?, `killdatetime` = ? where id = ?",
      messagequeueadmin: "update `messagequeue` set `status` = ?, `attempts` = ? where id = ?",
      messagequeueworker: "update `messagequeue` set  `updateddatetime` = ?, `status` = ?, `response` = ?, `errorcode` = ? where `key` = ? and `type` = ?",
      messagequeuereset: "update `messagequeue` set `startdatetime` = 0, `status` = 'new', `killdatetime` = 0 where `status` = 'started' and killdatetime <> 0 and `killdatetime` < unix_timestamp()",
      messagequeuerestart: "update `messagequeue` set `startdatetime` = 0, `status` = 'new', `killdatetime` = 0 where `errorcode` >= 300",
      messagequeuekill: "update `messagequeue` join `messagetype` ON `messagetype`.`name`= `messagequeue`.`type` and `messagetype`.`attempts` < `messagequeue`.`attempts` set `messagequeue`.`status` = 'dead' where `messagequeue`.`status` not in ('started','dead')",
      messagetype: "update `messagetype` set  `name` = ?, `ttl` = ?, `attempts` = ?, `limit` = ? where id = ?"
   },
   delete: {
      messagequeue: "update `messagequeue` set `deleted` = 1  where id = ?",
      messagetype: "update `messagetype` set `deleted` = 1 , `name` = concat(`name`,'.',unix_timestamp()) where id = ?"
   }
}
