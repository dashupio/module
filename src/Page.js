
// require base
const Base = require('./Base');

/**
 * create dashup page
 */
class DashupPage extends Base {

  /**
   * returns page type
   */
  static get type() {
    // return page type label
    return 'type';
  }

  /**
   * returns object of views
   */
  static get views() {
    // return object of views
    return {
      page    : '/path/to/file.riot.js',
      config  : '/path/to/file.riot.js',
      buttons : '/path/to/file.riot.js',
    };
  }

  /**
   * returns category list to show page in
   */
  static get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns category list to show page in
   */
  static get description() {
    // return description string
    return 'Page Descripton';
  }

  /**
   * alters page save event
   *
   * @param {*} param0 
   * @param {*} field 
   */
  async save({ req, dashup }, page) {
    // return once done
    return;
  }

  /**
   * alters resulting sanitised page
   *
   * @param {*} param0 
   * @param {*} field 
   * @param {*} value 
   */
  async sanitise({ req, dashup }, page, data) {
    // return value
    return data;
  }
}

// dashup field export
module.exports = DashupPage;