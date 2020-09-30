
// require base
const fs = require('fs-extra');
const io = require('socket.io-client');
const uuid = require('shortid');
const path = require('path');
const glob = require('@edenjs/glob');
const babel = require('@babel/core');
const minify = require('minify-stream');
const Spinnies = require('spinnies');
const babelify = require('babelify');
const browserify = require('browserify');
const babelPresetEnv = require('@babel/preset-env');
const { compile } = require('@riotjs/compiler');

// require local
const Base = require('./Base');

// cammel
const toCammel = (str) => {
  return str.split('-').join(' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
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

    // add listeners
    const endpoint = (name, fn) => {
      // run function
      this.connection.on(name, async (id, ...args) => {
        // get data
        const data = await fn(...args);

        // return data
        this.connection.emit(id, data);
      });
    };

    // add default RPC methods
    ['field', 'connect'].forEach((type) => {
      // create default endpoints
      endpoint(`${type}.save`, async (opts, data) => {
        console.log('save', opts);
        // save
        await this.register[`${type}s`][data.type].save(opts, data);

        // return field
        return { [type] : data };
      });
      endpoint(`${type}.submit`, async (opts, data, value) => {
        // save
        await this.register[`${type}s`][data.type].submit(opts, data, value);

        // return field
        return { [type] : data, value };
      });
      endpoint(`${type}.sanitise`, async (opts, data, value) => {
        // save
        const sanitised = await this.register[`${type}s`][data.type].sanitise(opts, data, value);

        // return field
        return { [type] : data, sanitised };
      });
    });
    
    // view endpoints
    endpoint('views', (views) => {
      // return promise
      return Promise.all(views.map(async (view) => {
        // read file
        return { code : await fs.readFile(this.views[view].path, 'utf8'), uuid : this.views[view].uuid };
      }));
    });

    // connect endpoints
    ['connect'].forEach((type) => {
      // endpoints
      endpoint(`${type}.message`, async (opts, data, message) => {
        // get action
        const actualValue = await this.register[`${type}s`][data.type].message(opts, data, message);

        // return field
        return { [type] : data, message : actualValue };
      });
      endpoint(`${type}.action`, async (action, opts, data, value) => {
        // get action
        const actualAction = this.register[`${type}s`][data.type].actions[action];

        // save
        const actualValue = await actualAction(opts, data, value);

        // return field
        return { [type] : data, value : actualValue };
      });
    });
  }

  /**
   * field register
   *
   * @param register 
   */
  fields(register) {
    
  }

  /**
   * page register
   *
   * @param register 
   */
  pages(register) {

  }

  /**
   * connect register
   *
   * @param register 
   */
  connects(register) {

  }

  /**
   * action register
   *
   * @param register 
   */
  actions(register) {

  }

  /**
   * trigger register
   *
   * @param register 
   */
  triggers(register) {

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
    const register = {
      pages    : {},
      fields   : {},
      actions  : {},
      connects : {},
      triggers : {},
    };
    
    // register pages
    const pageRegister = (PageClass, opts) => {
      // create class
      const createdPage = new PageClass(this, opts);

      // register page
      register.pages[createdPage.type] = createdPage;
    };
    await this.pages(pageRegister);

    // register fields
    const fieldRegister = (FieldClass, opts) => {
      // create class
      const createdField = new FieldClass(this, opts);

      // register field
      register.fields[createdField.type] = createdField;
    };
    await this.fields(fieldRegister);

    // register triggers
    const triggerRegister = (TriggerClass, opts) => {
      // create class
      const createdTrigger = new TriggerClass(this, opts);

      // register trigger
      register.triggers[createdTrigger.type] = createdTrigger;
    };
    await this.triggers(triggerRegister);

    // register actions
    const actionRegister = (ActionClass, opts) => {
      // create class
      const createdAction = new ActionClass(this, opts);

      // register action
      register.actions[createdAction.type] = createdAction;
    };
    await this.actions(actionRegister);

    // register connects
    const connectRegister = (ConnectClass, opts) => {
      // create class
      const createdConnect = new ConnectClass(this, opts);

      // register connect
      register.connects[createdConnect.type] = createdConnect;
    };
    await this.connects(connectRegister);

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
    ['pages', 'fields', 'actions', 'triggers', 'connects'].forEach((type) => {
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
        standalone : id,
        extensions : ['.js', '.ts', '.riot'],
      }).transform(babelify, {
        presets : [
          babel.createConfigItem([babelPresetEnv, {
            targets : {
              browsers : '> 0.25%, not dead',
            },
          }]),
        ],
        plugins : [
          ['@babel/plugin-transform-typescript', {
            strictMode : false,
          }],
        ],
        extensions : ['.js', '.ts', '.riot'],
      });

      // ws
      const ws = fs.createWriteStream(`${this.cache}/compiled/${newView}`);

      // Create browserify bundle
      const bundle = job.bundle();

      // bundle
      bundle.pipe(minify()).pipe(ws);

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
          // enabled functions
          save     : !!item.save,
          submit   : !!item.submit,
          message  : !!item.message,
          sanitise : !!item.sanitise,

          // data
          type        : item.type,
          data        : item.data,
          icon        : item.icon,
          views       : item.views,
          title       : item.title,
          actions     : Object.keys(item.actions || {}),
          categories  : item.categories,
          description : item.description,
        };
      });

      // return accum
      return accum;
    }, {}));

    // create rpc
    connection.rpc = (name, ...args) => {
      // RPC module
      const rpc = uuid();

      // resolve promise
      return new Promise((resolve) => {
        // emit
        connection.once(rpc, resolve);

        // emit rpc
        connection.emit(name, rpc, ...args);
      });
    };

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