
// require base
const fs = require('fs-extra');
const io = require('socket.io-client');
const uuid = require('shortid');
const path = require('path');
const glob = require('@edenjs/glob');
const minify = require('minify-stream');
const Spinnies = require('spinnies');
const babelify = require('babelify');
const browserify = require('browserify');
const { compile } = require('@riotjs/compiler');

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

    // ensure
    await fs.ensureDir(`${this.cache}/views`)

    // await compile all views
    const files = await glob(`${path.resolve('./views')}/**/*.riot`);

    // await compile all views
    await Promise.all((await glob(`${path.resolve('./views')}/**/*`)).filter((f) => f.includes('.') && !f.includes('.riot')).map(async (extra) => {
      // get new path
      const newPath = path.resolve(`${this.cache}/views${extra.replace(path.resolve('./views'), '')}`);

      // ensure
      await fs.ensureDir(path.dirname(newPath));

      // write
      await fs.writeFile(newPath, await fs.readFile(extra, 'utf8'));
    }));

    // compile and move
    await Promise.all(files.map(async (file) => {
      // code
      const riotCode = (await compile(await fs.readFile(file, 'utf8'), {
        file,
        comments : false,
      })).code;

      // get new path
      const newPath = path.resolve(`${this.cache}/views${file.replace(path.resolve('./views'), '')}`);

      // ensure
      await fs.ensureDir(path.dirname(newPath));

      // write
      await fs.writeFile(newPath, riotCode);
    }));

    // compiled
    await fs.ensureDir(`${this.cache}/compiled`);

    // compile
    for (const view of Array.from(views)) {
      // file location
      const id   = toCammel(`v${uuid()}`);
      const file = path.resolve(`${this.cache}/views/${view}${view.includes('.riot') ? '' : '.riot'}`);

      // view
      let newView = view.replace('.riot', '');
      newView = newView.split('/').join('-');

      // Browserify javascript
      const job = browserify({
        entries    : [file],
        sourceMap  : false,
        standalone : id,
        extensions : ['.js', '.ts', '.riot'],
      }).transform(babelify, {
        presets : [
          ['@babel/preset-env', {
            targets : {
              browsers : '> 0.25%, not dead',
            },
          }],
        ],
        plugins : [
          ['@babel/plugin-transform-typescript', {
            strictMode : false,
          }],
        ],
        sourceMap  : false,
        extensions : ['.js', '.ts', '.riot'],
      });
  
      // ws
      const ws = fs.createWriteStream(`${this.cache}/compiled/${newView}`);

      // Create browserify bundle
      const bundle = job.bundle();

      // bundle
      bundle.pipe(minify({
        sourceMap : false,
      })).pipe(ws);

      // await done
      await new Promise((resolve, reject) => {
        // end
        bundle.once('end', resolve);
        bundle.once('error', reject);
      });

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

    // connection
    const connection = io.connect(`${this.config.url || 'https://dashup.io'}?module=${this.config.key}`, this.config.socket || {
      reconnect : true,
    });

    // await connection
    await new Promise((resolve) => {
      // await connection
      connection.once('dashup.ready', resolve);
    });

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


    // ////////////////////////////////////////////////////////////////////////////
    //
    // CONNECTION CALL METHODS
    //
    // ////////////////////////////////////////////////////////////////////////////
    
    // loop for call methods
    ['rpc', 'hook', 'event', 'action'].forEach((key) => {
      // call connection event
      connection[key] = (opts, name, ...args) => {
        // get id
        const id = uuid();

        // out
        console.log(`[out] [${key}] [${name}] ${opts.type}:${opts.struct}`);

        // call
        return new Promise((resolve) => {
          // await once
          connection.once(id, resolve);
          connection.emit(`dashup.${key}`, {
            ...opts,
  
            id,
          }, name, ...args);
        });
      };
    });


    // ////////////////////////////////////////////////////////////////////////////
    //
    // CONNECTION RECEIVE METHODS
    //
    // ////////////////////////////////////////////////////////////////////////////


    // loop events
    ['hook', 'event', 'action'].forEach((key) => {
      // add event
      connection.on(`dashup.${key}`, async (opts, name, ...args) => {
        // log
        console.log(`[in] [${key}] [${name}] ${opts.type}:${opts.struct}`);

        // get class
        const fnClass = this.register[`${opts.type}s`][opts.struct];

        // get call
        const fnCall = (fnClass[`${key}s`] || {})[name];

        // check action
        if (!fnCall) return;

        // save
        const data = await fnCall(opts, ...args);

        // resolve
        if (opts.id) this.connection.emit(opts.id, data);
      });
    });

    // rpc calls
    connection.on('dashup.rpc', async (opts, name, ...args) => {
      // standard rpc
      if (name === 'views') {
        // view names
        const [viewNames] = args;

        // check exists
        const views = await Promise.all(viewNames.map(async (view) => {
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

        // emit resulting views
        connection.emit(opts.id, views);
      }
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