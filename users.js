const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/NetSecurity', { useNewUrlParser: true });
var UserSchema = new mongoose.Schema({
  id:{type:Number},
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  posts:[{type: String}]
});




var User = mongoose.model('User', UserSchema);
module.exports = User;

//module.exports.validPassword = function(password,password)
