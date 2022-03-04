
// import regenerator
const regeneratorRuntime = require('regenerator-runtime');

// require base

const fs = require('fs-extra');
const io = require('socket.io-client');
const uuid = require('shortid');
const path = require('path');
const sassify = require('sassify');
const Spinnies = require('spinnies');
const babelify = require('babelify');
const DashupRPC = require('@dashup/rpc');
const browserify = require('browserify');

// require local
const Base = require('./Base');

// cammel
const toCammel = (str) => {
  return str.split('-').join(' ').split('_').join(' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

/**
 * create dashup field
 */
class DashupModule extends Base {
  /**
   * construct dashup module
   */
  constructor() {
    // run super
    super();

    // global
    global.dashup = this;

    // run build
    this.building = this.build();
  }

  /**
   * build dashup module
   */
  async build() {
    // spinnies
    this.spinnies = new Spinnies();

    // load config
    this.config = await this.__config();

    // load cache
    this.cache = await this.__cache();

    // load register
    this.register = await this.__register();

    // load views
    this.views = await this.__views();

    // load views
    this.connection = await this.__connect();
  }

  /**
   * field register
   *
   * @param register 
   */
  register(register) {
    
  }

  /**
   * Create config
   */
  async __config() {
    // add spinner
    this.spinnies.add('config', {
      text : 'Loading config...',
    });

    // check dashup.json file
    const configLocation = path.resolve('./.dashup.json');

    // check exists
    if (!await fs.exists(configLocation)) {
      // fail spinnies
      this.spinnies.fail('config');

      // check config
      console.error('[error] `.dashup.json` is required!');

      // exit
      return process.exit();
    }

    // load config
    const config = JSON.parse(await fs.readFile(configLocation));

    // check key
    if (!config.key) {
      // fail spinnies
      this.spinnies.fail('config');

      // check config
      console.error('[error] `.dashup.json` must include `key`');

      // exit
      return process.exit();
    }

    // succeed spinner
    this.spinnies.succeed('config', {
      text : 'Loaded Config!',
    });

    // return config
    return config;
  }

  /**
   * create cache
   */
  async __cache() {
    // cache location
    const cacheLocation = path.resolve('./.cache');

    // add spinner
    this.spinnies.add('cache', {
      text : 'Creating Cache...',
    });

    // create cache
    await fs.remove(cacheLocation);
    await fs.ensureDir(cacheLocation);

    // succeed spinner
    this.spinnies.succeed('cache', {
      text : 'Created Cache!',
    });

    // return cache location
    return cacheLocation;
  }

  /**
   * create cache
   */
  async __register() {
    // add spinner
    this.spinnies.add('register', {
      text : 'Compiling Register...',
    });

    // register
    const register = {};

    // create register
    const registerFn = (type, Class, opts) => {
      // create class
      const createdClass = new Class(opts);

      // complete
      if (!register[`${type}s`]) register[`${type}s`] = {};
      register[`${type}s`][createdClass.type] = createdClass;
    };
    await this.register(registerFn);

    // succeed spinner
    this.spinnies.succeed('register', {
      text : 'Compiled Register!',
    });

    // return register
    return register;
  }

  /**
   * create cache
   */
  async __views() {
    // add spinner
    this.spinnies.add('views', {
      text : 'Compiling Views...',
    });

    // load views
    const views    = new Set();
    const compiled = {};

    // loop pages/etc
    Object.keys(this.register).forEach((type) => {
      // types
      Object.values(this.register[type]).forEach((thing) => {
        // values again
        Object.values(thing.views).forEach((view) => views.add(view));
      });
    });

    // compiled
    await fs.ensureDir(`${this.cache}/compiled`);

    // extensions
    const extensions = ['.tsx', '.jsx', '.ts', '.js', '.scss'];

    // compile
    for (const view of Array.from(views)) {
      // check exists
      if (!extensions.find((ext) => {
        // return exists promise
        return fs.existsSync(`./views/${view.split('.')[0]}${ext}`);
      })) {
        // out
        console.warn(`[views] [${view}] File not found`);

        // continue
        continue;
      }

      // file location
      const id   = toCammel(`v${uuid()}`);
      const file = path.resolve(`./views/${view}`);

      // view
      const newView = view.split('/').join('-');

      // try/catch
      try {
        // Browserify javascript
        const job = browserify({
          extensions,
          entries    : [file],
          sourceMap  : false,
          standalone : id,
        })
        .transform(babelify, {
          extensions,
          global  : true,
          presets : [
            ['@babel/preset-env', {
              targets : {
                browsers : ['last 3 versions', 'not < 0.25%', 'not dead', 'not ie 11', 'not op_mini all'],
              },
            }],
            '@babel/preset-typescript',
            '@babel/preset-react',
          ],
          plugins : [
            '@babel/plugin-syntax-class-properties',
          ]
        })
        .transform(sassify, {
          sourceMap : false,
        })
          .plugin('tinyify')
          .external('react')
          .external('moment')
          .external('react-dom')
          .external('@dashup/ui')
          .external('@dashup/core')
          .external('react-select')
          .external('react-bootstrap')
          .external('simplebar-react')
          .external('react-sortablejs')
          .external('react-select/async')
          .external('react-awesome-query-builder');
    
        // ws
        const ws = fs.createWriteStream(`${this.cache}/compiled/${newView}`);

        // Create browserify bundle
        const bundle = job.bundle();

        // bundle
        bundle.pipe(ws);

        // await done
        await new Promise((resolve, reject) => {
          // end
          bundle.once('end', resolve);
          bundle.once('error', reject);
        });
      } catch (e) {
        console.log(e);
      }

      // compiled view
      compiled[view] = { path : `${this.cache}/compiled/${newView}`, uuid : id, };
    }

    // succeed spinner
    this.spinnies.succeed('views', {
      text : 'Compiled Views!',
    });

    // return cache location
    return compiled;
  }

  /**
   * create cache
   */
  async __connect() {
    // add spinner
    this.spinnies.add('connect', {
      text : 'Connecting to Dashup...',
    });

    // create url
    let url = `${this.config.url || 'https://dashup.io'}?module=${this.config.key}`;

    // check if environment
    if (process.env.DASHUP_NODE) {
      // add url to node
      url = `${url}&node=${process.env.DASHUP_NODE}`;
    }

    // connection
    const connection = io.connect(url, this.config.socket || {
      reconnect : true,
    });

    // await connection
    await new Promise((resolve) => {
      // await connection
      connection.once('dashup.ready', resolve);
    });

    // emit register
    const emitRegister = () => {
      // send register
      connection.emit('dashup.register', Object.keys(this.register).reduce((accum, key) => {
        // register types
        accum[key] = Object.values(this.register[key]).map((item) => {
          // return object
          return {
            // descriptors
            type        : item.type,
            icon        : item.icon,
            title       : item.title,
            categories  : item.categories,
            description : item.description,

            // data
            data  : item.data,
            views : item.views,

            // actions
            hooks   : Object.keys(item.hooks || {}),
            events  : Object.keys(item.events || {}),
            actions : Object.keys(item.actions || {}),
          };
        });

        // return accum
        return accum;
      }, {}));
    }

    // on connect emit
    emitRegister();
    connection.on('connect', emitRegister);


    // ////////////////////////////////////////////////////////////////////////////
    //
    // CONNECTION CALL METHODS
    //
    // ////////////////////////////////////////////////////////////////////////////

    // create rpc class
    this.duRPC = new DashupRPC(connection);
    
    // loop for call methods
    ['rpc', 'hook', 'event', 'action'].forEach((key) => {
      // create calls
      connection[key] = (opts, name, ...args) => {
        // log
        console.log(`[out] [${key}] [${name}] ${opts.type}:${opts.struct}`);

        // create rpc callback
        return this.duRPC.call({}, key, opts, name, args);
      };
    });

    // loop events
    ['hook', 'event', 'action'].forEach((key) => {
      // add endpoints
      this.duRPC.endpoint(key, (opts, name, args) => {
        // log
        console.log(`[in] [${key}] [${name}] ${opts.type}:${opts.struct}`);

        // get class
        const fnClass = this.register[`${opts.type}s`][opts.struct];

        // get call
        const fnCall = (fnClass[`${key}s`] || {})[name];

        // check action
        if (!fnCall) throw new Error('method does not exist');

        // return await
        return fnCall(opts, ...args);
      });
    });

    // add pong endpoint
    this.duRPC.endpoint('ping', () => {
      // return pong
      return true;
    });

    // add endpoints
    this.duRPC.endpoint('rpc', (opts, name, args) => {
      // views
      const [views] = args;

      // log
      console.log(`[in] [views] [${views.join(', ')}] ${opts.type}:${opts.struct}`);

      // check exists
      return Promise.all(views.map(async (view) => {
        // get from register
        const structViews = ((this.register[`${opts.type}s`] || {})[opts.struct] || {}).views || {};

        // struct views
        if (structViews[view]) view = structViews[view];

        // check file
        if (this.views[view]) {
          // return data
          return {
            code : await fs.readFile(this.views[view].path, 'utf8'),
            uuid : this.views[view].uuid,
          };
        }
      }));
    });

    // succeed spinner
    this.spinnies.succeed('connect', {
      text : 'Connected to Dashup!',
    });

    // return connection
    return connection;
  }
}

// dashup field export
module.exports = DashupModule;