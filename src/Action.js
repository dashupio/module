
// import action interface
const Base = require('./Base');

/**
 * build address helper
 */
class DashupAction extends Base {
  /**
   * construct action
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);
  }

  /**
   * returns action type
   */
  get type() {
    // return action type label
    return 'type';
  }

  /**
   * returns action type
   */
  get title() {
    // return action type label
    return 'Title';
  }

  /**
   * returns action icon
   */
  get icon() {
    // return action icon label
    return 'fa fa-phone';
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      config : 'action/example/config',
    };
  }

  /**
   * returns category list for action
   */
  get categories() {
    // return array of categories
    return [];
  }

  /**
   * returns action descripton for list
   */
  get description() {
    // return description string
    return 'Example Action';
  }
}

// dashup field export
module.exports = DashupAction;