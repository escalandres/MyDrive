const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        userId: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        hashedPassword: {type: String, required: true}
    },
    {collection: 'users'}
)

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model