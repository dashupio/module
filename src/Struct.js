
// import action interface
const Base = require('./Base');

/**
 * build address helper
 */
class DashupStruct extends Base {
  /**
   * construct action
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // Identification Methods
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * returns action type
   */
  get type() {
    // return action type label
    return 'type';
  }

  /**
   * returns action icon
   */
  get icon() {
    // return action icon label
    return 'fa fa-phone';
  }

  /**
   * returns action type
   */
  get title() {
    // return action type label
    return 'Title';
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


  // ////////////////////////////////////////////////////////////////////////////
  //
  // Data Methods
  //
  // ////////////////////////////////////////////////////////////////////////////


  /**
   * returns field data
   */
  get data() {
    // return field data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      config : 'thing/example/config',
    };
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // Routing Methods
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * returns events object
   */
  get hooks() {
    // return object of views
    return {
    };
  }

  /**
   * returns events object
   */
  get events() {
    // return object of views
    return {
    };
  }

  /**
   * returns events object
   */
  get actions() {
    // return object of views
    return {
    };
  }
}

// dashup field export
module.exports = DashupStruct;