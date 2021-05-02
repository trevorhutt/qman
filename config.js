
module.exports = {
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    secret: process.env.QMAN_SECRET,
    debug: (process.env.QMAN_DEBUG == 1)
}













