const mongoConfig = process.env.URL_MONGO;
const mongoose = require('mongoose');
mongoose.connect(mongoConfig.connect);
require('./Projects');
module.exports = mongoose;
