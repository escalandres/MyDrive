const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

const uri = process.env.DATABASE_URL;
console.log('uri', uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db('mydrive');
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
  }
}

async function disconnect() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  } catch (err) {
    console.error('Error disconnecting from MongoDB Atlas:', err);
  }
}

async function getUserByEmail(email) {
  try {
    const client = await connect()
    const dbResult = await client.collection("users").findOne({email: email});
      // const User = mongoose.model('User', {
      //     userId: {type: String, required: true, unique: true},
      //     email: {type: String, required: true, unique: true},
      //     name: {type: String, required: true},
      //     hashedPassword: {type: String, required: true}
      //   },
      //   {collection: 'users'}
      // );
      //   console.log('email',email)
      // const user = await User.findOne({ email }).maxTimeMS(10000).exec();

      if (dbResult) {
        return {success: true, user: dbResult };
      } else {
        return {success: false, user: {}}
      }
  } catch (error) {
      console.error('Error al buscar el usuario. ',error);
  } finally {
      disconnect();
  }
}
module.exports = {
  connect: connect,
  disconnect: disconnect,
  getUserByEmail: getUserByEmail
};