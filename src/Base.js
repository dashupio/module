
// require base
const Events  = require('events');
const dotProp = require('dot-prop');
const deepEqual = require('fast-deep-equal');

/**
 * create dashup field
 */
class DashupBase extends Events {
  /**
   * construct dashup base
   */
  constructor (data = {}) {
    // run super
    super();

    // set base
    this.dashup = global.dashup;

    // set data
    this.__data = data;

    // bind methods
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  // //////////////////////////////////////////////////////////////////////
  //
  // STATIC METHODS
  //
  // //////////////////////////////////////////////////////////////////////

  /**
   * gets key
   *
   * @param {*} key 
   */
  get(key, alt) {
    // check key
    const got = dotProp.get(this.__data, key);

    // check undefined
    if (typeof got === 'undefined' && typeof alt !== 'undefined') {
      // run alt function if required
      if (typeof alt === 'function') {
        // check if promise
        const actualAlt = alt();

        // check alt
        if (actualAlt instanceof Promise) {
          // return promise
          return actualAlt.then((resolvedAlt) => {
            // set key/value
            this.set(key, resolvedAlt);
  
            // return actual alt
            return resolvedAlt;
          });
        } else {
          // set key/value
          this.set(key, actualAlt);

          // return actual alt
          return actualAlt;
        }
      } else {
        // set key/alt
        this.set(key, alt);

        // return alt
        return alt;
      }
    }

    // return got
    return got;
  }

  /**
   * sets key
   *
   * @param {*} key 
   * @param {*} value 
   */
  set(key, value) {
    // try/catch
    try {
      // check emission
      if (this.get(key) && deepEqual(this.get(key), value)) return this;
    } catch (e) {}

    // set
    dotProp.set(this.__data, key, value);

    // emit
    const emission = [];

    // emit all
    key.split('.').forEach((section) => {
      // push section
      emission.push(section);

      // emit
      this.emit(emission.join('.'), this.get(emission.join('.')));
    });

    // return done
    return this;
  }
}

// dashup field export
module.exports = DashupBase;