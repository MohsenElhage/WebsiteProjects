
const crypto = require('crypto');
module.exports={
JWT_TOKEN: crypto.randomBytes(32).toString('hex'),
 DB_URL:"mongodb+srv://mohsenelhage:XQLctwHMnX1Q1ht3@kurlz.ypcmcyb.mongodb.net/?retryWrites=true&w=majority"
}
