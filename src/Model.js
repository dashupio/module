
// require base
const Base = require('./Base');

/**
 * create class
 */
class Model extends Base {

  /**
   * construct dashup base
   */
  constructor (base, data = {}) {
    // run super
    super(base, data);

    // set
    Object.keys(this.__data).forEach((key) => {
      // set to update model
      this.set(key, this.__data[key]);
    });

    // save
    this.save     = this.save.bind(this);
    this.sanitise = this.sanitise.bind(this);
  }


  // //////////////////////////////////////////////////////////////////////
  //
  // NORMAL METHODS
  //
  // //////////////////////////////////////////////////////////////////////

  /**
   * get opts
   */
  set(key, value) {
    // check value
    if (Array.isArray(value)) {
      // loop value
      value = value.map((item) => {
        //  return model or item
        return item && item._meta ? new Model(item) : item;
      });
    }

    // return parent set
    return super.set(key, value);
  }

  /**
   * save model
   */
  async save(opts) {
    // args
    const args = [this.sanitise()];

    // unshift to args
    if (this.get('_id')) args.unshift(this.get('_id'));
    
    // deafen action
    return this.dashup.connection.rpc(opts, 'model.update', ...args);
  }

  /**
   * sanitise item
   */
  sanitise() {
    // sanitised data
    const sanitisedData = {};

    // loop
    Object.keys(this.__data).forEach((key) => {
      // check array
      if (Array.isArray(this.__data[key]) && this.__data[key][0] instanceof Model) {
        // array of models
        sanitisedData[key] = this.__data[key].map(mod => mod.get('_id') || mod.get('id'));
      } else if (this.__data[key] instanceof Model) {
        // return id
        sanitisedData[key] = this.__data[key].get('_id') || this.__data[key].get('id');
      } else {
        // set
        sanitisedData[key] = this.__data[key];
      }
    });

    // return data
    return sanitisedData;
  }
}

/**
 * export model
 */
module.exports = Model;