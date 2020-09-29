
// require base
const Base = require('./Base');

/**
 * create dashup field
 */
class DashupField extends Base {

  /**
   * returns field type
   */
  static get type() {
    // return field type label
    return 'type';
  }
  /**
   * returns field data
   */
  static get data() {
    // return field data
    return {};
  }

  /**
   * returns object of views
   */
  static get views() {
    // return object of views
    return {
      view   : '/path/to/file',
      input  : '/path/to/file',
      config : '/path/to/file',
    };
  }

  /**
   * returns category list to show field in
   */
  static get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns category list to show field in
   */
  static get description() {
    // return description string
    return 'Field Descripton';
  }
}

// dashup field export
module.exports = DashupField;