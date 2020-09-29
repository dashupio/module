Dashup Module
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module.svg)](https://github.com/dashup/module/releases/latest)
=====

A pluggable interface for creating functionality within [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Page interface](#page)
* [Field interface](#field)
* [Action interface](#action)
* [Trigger interface](#trigger)
* [Connect interface](#connect)

## Get Started

Dashup uses a very simple interface system to build logic. Clone our default interface repo to get started:

1. `git clone git@github.com:dashupio/module-base.git .`
2. `npm i`
3. `npm run start`

## Page

## Field

The field interface enables creating or extending custom fields within Dashup forms.

To create a field you'll first need to extend the field interface and set all of the data:

```js
// import field interface
import { Field } from '@dashup/module';

/**
 * build address helper
 */
export default class ExampleField extends Field {

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
      input  : 'field/example/input',  // input view is required
      render : 'field/example/render', // input render is required
    };
  }

  /**
   * returns category list for field
   */
  static get categories() {
    // return array of categories
    return ['frontend'];
  }

  /**
   * returns field descripton for list
   */
  static get description() {
    // return description string
    return 'Field Descripton';
  }
}
```

### Views

Fields must return an object of available [riot](https://riot.js.org/) views stored in `/views` in the root of this project. These views are automatically loaded and included when the field needs them in the Dashup frontend.

#### Altering tabs

```js
  /**
   * returns object of data
   */
  static get data() {
    // return object of data
    return {
      tabs : ['Field', 'Validate'], // array of tabs to display in field modal
    };
  }
```

#### Registering views

```js
  /**
   * returns object of views
   */
  static get views() {
    // return object of views
    return {
      input  : 'field/example/input',  // input view is required
      render : 'field/example/render', // input render is required

      // each subsequent view is loaded with it's associated tab in the `config` modal
      field    : 'field/example/field', // loaded into the `field` tab in the modal
      validate : 'field/example/validate', // loaded into the `field` tab in the modal
    };
  }
```

### Methods

Fields also have 3 optional methods that enable extra functionality:

#### Sanitise

The Field Sanitise method returns different data compared to what is stored in the database for use in the frontend:

```js
  /**
   * returns sanitised data from the database
   * 
   * @param {Object} { req, dashup }
   * @param {Object} field field config
   * @param {*} value stored value
   */
  async sanitise({ req, dashup }, field, value) {
    // return different data
    return {
      different : 'data',
    };
  }
```

#### Submit

The Field Sanitise method returns different data to be stored in the database:

```js
  /**
   * returns database data from submitting the field
   * 
   * @param {Object} { req, dashup }
   * @param {Object} field field config
   * @param {*} value expected body value
   */
  async submit({ req, dashup }, field, value) {
    // return different data
    return {
      different : 'data',
    };
  }
```

#### Save

The Field Save method allows altering the field config when it's saved within a form:

```js
  /**
   * hooks field alterations before saving to the database
   * 
   * @param {Object} { req, dashup }
   * @param {Object} field field config
   */
  async save({ req, dashup }, field) {
    // set different info
    field.different = true;
  }
```

## Action

## Trigger

## Connect