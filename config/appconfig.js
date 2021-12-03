let appconfig ={}
appconfig.port = 3000
appconfig.allowedCorsOrigin = "*"
appconfig.env = 'dev'
appconfig.db = {
    uri : 'mongodb://127.0.0.1:27017/chatAppDB'
}
appconfig.version = '/chat',
appconfig.host = '127.0.0.1'

module.exports = {
    port :appconfig.port,
    origin :appconfig.allowedCorsOrigin,
    env : appconfig.env,
    db : appconfig.db,
    version : appconfig.version,
    host: appconfig.host
}
