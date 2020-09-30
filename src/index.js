
// require interfaces
const Page    = require('./Page');
const Field   = require('./Field');
const Query   = require('./Query');
const Model   = require('./Model');
const Module  = require('./Module');
const Action  = require('./Action');
const Connect = require('./Connect');

/**
 * module interface base class
 */
class ModuleInterface {

  /**
   * get field
   */
  get Field() {
    // return field interface
    return Field;
  }

  /**
   * get field
   */
  get Page() {
    // return field interface
    return Page;
  }

  /**
   * get field
   */
  get Module() {
    // return field interface
    return Module;
  }

  /**
   * get field
   */
  get Connect() {
    // return field interface
    return Connect;
  }

  /**
   * get action
   */
  get Action() {
    // return action interface
    return Action;
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
}

// create new
module.exports = new ModuleInterface();