
// require base
const Base = require('./Base');

/**
 * create dashup connect
 */
class DashupConnect extends Base {

  /**
   * returns connect type
   */
  get type() {
    // return connect type label
    return 'example';
  }

  /**
   * returns connect type
   */
  get title() {
    // return connect type label
    return 'Example';
  }

  /**
   * returns connect icon
   */
  get icon() {
    // return connect icon label
    return 'fab fa-example';
  }

  /**
   * returns connect data
   */
  get data() {
    // return connect data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      config : 'connect/example/config',
    };
  }

  /**
   * returns connect actions
   */
  get actions() {
    // return connect actions
    return {};
  }

  /**
   * returns category list for connect
   */
  get categories() {
    // return array of categories
    return ['chat'];
  }

  /**
   * returns connect descripton for list
   */
  get description() {
    // return description string
    return 'Example Connector';
  }

  /**
   * returns true if connector applies to page
   *
   * @param {*} param0 
   * @param {*} field 
   */
  async can({ req, dashup }, page) {
    // return once done
    return true;
  }

  /**
   * returns sanitised result of field submission
   *
   * @param {*} param0 
   * @param {*} field 
   */
  async save({ req, dashup }, field) {
    // return once done
    return;
  }

  /**
   * returns sanitised result of field submission
   *
   * @param {*} param0 
   * @param {*} field 
   * @param {*} value 
   */
  async submit({ req, dashup, old }, field, value) {
    // return database value
    return value;
  }

  /**
   * returns sanitised result of field submission
   *
   * @param {*} param0 
   * @param {*} field 
   * @param {*} value 
   */
  async sanitise({ req, dashup }, field, value) {
    // return value
    return value;
  }
}

// dashup field export
module.exports = DashupConnect;