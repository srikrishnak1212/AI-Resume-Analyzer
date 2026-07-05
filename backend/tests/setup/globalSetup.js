'use strict';

/**
 * Jest Global Setup — starts an in-memory MongoDB instance before all tests.
 * Sets MONGODB_URI env var so the app connects to it instead of the real DB.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';

  // Store the instance reference so globalTeardown can stop it
  global.__MONGOD__ = mongod;
};
