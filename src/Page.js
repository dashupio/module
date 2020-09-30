
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
   * returns page type
   */
  static get icon() {
    // return page type label
    return 'fa fa-database';
  }

  /**
   * returns object of views
   */
  static get views() {
    // return object of views
    return {
      view   : 'page/example/view',
      config : 'page/example/config',
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
}

// dashup field export
module.exports = DashupPage;