const moment = require('moment')

const formatPostDate = (date) => moment(date, "YYYYMMDD").fromNow()

exports.formatPostDate = formatPostDate