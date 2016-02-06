# Studio-Desktop

The desktop(HD) application for Studio based on the following stacks:

- React
- Electron
- Webpack, Makefile

![v1.0](./history/v1.0.png)

## Build

Studio-desktop is able to build and release for the following platforms:

- Native application
  - [x] Mac OSX
  - [x] Windows
  - [ ] Linux

- Browser SPA(Single Page Application)
  - [x] latest Chrome
  - [ ] latest safri

### Build Dependencies

* NodeJS (>= 5.0.0) See [Official Repo](https://nodejs.org/en/download/)
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

Currently we only support MacOS

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

## License

WeFlex Copyright

