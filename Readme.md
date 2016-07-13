# Studio-Desktop

The desktop(HD) application for Studio based on the following stacks:

- React
- TypeScript
- Electron
- Webpack & Makefile

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

### Generic build

To make a static build, simply

```sh
$ make
```

### Electron

```
$ make electron
```

Currently we only support MacOS and Windows.

### Web 

```sh
$ make serve
```

We setup a `Procfile` to be compatible with Heroku:

```
$ make heroku
```

> Note: because we are still using http in API endpoint, so http is required to visit Heroku.

## Development

```sh
$ make watch
$ curl http://localhost:8080/
```

### Change the endpoint of being used by gian.js:

Run local test gateway with the following command:

```sh
$ GIAN_GATEWAY=test make watch
```

Run with staging

```sh
$ GIAN_GATEWAY=staging make watch
```

The default `GIAN_GATEWAY` is "staging".

## License

WeFlex Copyright

