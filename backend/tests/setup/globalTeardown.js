'use strict';

/**
 * Jest Global Teardown — stops the in-memory MongoDB instance after all tests.
 */

module.exports = async () => {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
};
