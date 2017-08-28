# Studio-Desktop

The desktop(HD) application for Studio based on the following stacks:

- React
- TypeScript
- Electron
- Webpack

![v1.0](./history/v1.0.png)

## Build

Studio-desktop is able to build and release for the following platforms:

- Native application
  - [x] Mac OSX
  - [x] Windows
  - [x] Linux

- Browser SPA(Single Page Application)
  - [x] latest Chrome
  - [x] latest Safri
  - [ ] latest Windows Edge

### Build Dependencies

* Node.js
* Make
* GNU Make 3.81

### Development
```sh
$ npm start    // => use dev server api and data, To make a static build, simply. and run in local machine.
```

or

```sh
$ npm run build:dev  // => use dev server api and data, To make a static build, simply.
$ npm run dev        // => run in local machine
```

### Product
use product server api and data
```sh
$ npm run build:prod  // => use prod server api and data, To make a static build, simply.
$ npm run prod        // => run in local machine
```

## License

WeFlex Copyright
