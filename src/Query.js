// import model
const Model = require('./Model');

// create dashup base class
class DashupQuery {

  /**
   * construct dashup query
   */
  constructor(opts, type) {
    // set module
    this.opts   = opts;
    this.query  = [];
    this.dashup = global.dashup;

    // loop query methods
    ['where', 'eq', 'inc', 'gt', 'or', 'lt', 'gte', 'lte', 'search', 'skip', 'sort', 'limit', 'match', 'ne', 'nin', 'in', 'or', 'and'].forEach((method) => {
      // set method
      this[method] = (...args) => {
        // push to query
        this.query.push([method, args]);

        // return this
        return this;
      };
    });

    // complete
    ['sum', 'count', 'find', 'findOne', 'findById', 'findByIds'].forEach((method) => {
      // push to query
      this[method] = async (...args) => {
        // push to query
        this.query.push([method, args]);

        // call
        const data = await this.dashup.connection.rpc(this.opts, `${type}.query`, this.query);

        // return types
        if (Array.isArray(data)) {
          return data.map(item => new Model(item));
        }
        if (data && typeof data === 'object') {
          return new Model(data);
        }

        // return data
        return data;
      };
    });
  }
}

// export query
module.exports = DashupQuery;