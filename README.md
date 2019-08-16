<p align="center"><img src="https://cushiondb.github.io/img/logo-small.png"></p>

# Overview

CushionDB is an open source, easy-to-use data management framework for building small, offline-first, PWA compliant applications. It simplifies the process of managing and persisting single-user data without writing any server-side database code and provides user authentication capabilities that are crucial for efficient client-side data management.

CushionDB expands on current offline-first data models by employing different PWA tools that ensure data integrity regardless of network connectivity, and abstracts many of the complexities around utilizing these tools for native-like client side data management.

CushionClient is designed to work with [CushionSever](https://github.com/CushionDB/CushionServer) and a pre-configured CouchDB we call [CushionCouch](https://github.com/CushionDB/CushionCouchDocker). Both CushionServer and CushionCouch are setup as Docker images and can easily be built, configured and run using a simple script provided by CushionDB.

## CushionDB Architecture

<p align="center"><img src="https://cushiondb.github.io/img/cushion-arch.png"></p>

# Getting Started

## Prerequisites

* Node.js >= 10.16.3 - *CushionClient*
* Docker - *CushionServer and CushionCouch*

## Install

```
npm i cushion-client
```

## Setup


## Sample Usage

```js
import Cushion from 'cushiondb';
// or
const Cushion = require('cushiondb');
```

```js
// instantiate a new CushionDB object
const cushion = new Cushion();

// sign up a new user
cushion.account.signUp({
  username: 'jDoe',
  password: 'secret'
 });
 
 // add a document to the database
cushion.store.set({
  title: 'todo',
  completed: false
 }).then(id => {
  // do something
 }).catch(err => {
 // handle error
});
```

[Full API Documentation]()

# The Team

[Avshar Kirksall]() *Software Engineer* Brooklyn, NY

[Jaron Truman]() *Software Engineer* Las Vegas, NV

[Daniel Rote]() *Software Engineer* Seattle, WA
