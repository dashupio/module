
// require interfaces
const Base   = require('./Base');
const Query  = require('./Query');
const Model  = require('./Model');
const Struct = require('./Struct');
const Module = require('./Module');

/**
 * module interface base class
 */
class ModuleInterface {

  /**
   * get field
   */
  get Base() {
    // return field interface
    return Base;
  }

  /**
   * get field
   */
  get Struct() {
    // return field interface
    return Struct;
  }

  /**
   * get field
   */
  get Query() {
    // return field interface
    return Query;
  }

  /**
   * get field
   */
  get Model() {
    // return field interface
    return Model;
  }

  /**
   * get field
   */
  get Module() {
    // return field interface
    return Module;
  }
}

// create new
module.exports = new ModuleInterface();