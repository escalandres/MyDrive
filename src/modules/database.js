const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const User = require('../../model/user');
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

    if (dbResult) {
      return {success: true, user: dbResult, error: "" };
    } else {
      return {success: false, user: {}, error: "Usuario no encontrado"}
    }
  } catch (error) {
    console.error('Error al buscar el usuario. ',error);
    return {success: false, user: {}, error: error}
  } finally {
    disconnect();
  }
}

async function createNewUser(userId, email, name, hashedPassword) {
  try {
    const client = await connect()
    const usersCollection = client.collection('users');

    // Crear índices únicos en email y userId
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ userId: 1 }, { unique: true });

    const dbResult = await usersCollection.insertOne({ userId, email, name, hashedPassword });
    if (dbResult) {
      return {success: true, message: dbResult};
    } else {
      return {success: false, message: dbResult};
    }
  } catch (error) {
    console.error('Error al buscar el usuario. ',error);
    return {success: false, message: error};
  } finally {
    disconnect();
  }
}


module.exports = {
  connect: connect,
  disconnect: disconnect,
  getUserByEmail: getUserByEmail,
  createNewUser: createNewUser
};