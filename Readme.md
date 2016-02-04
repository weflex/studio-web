# Studio-Desktop

The desktop(HD) application for Studio based on the following stacks:

- React
- Electron
- Webpack, Makefile

![v1.0](./history/v1.0.png)

## Build

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

To deploy to [Heroku Endpoint](http://weflex-admin.herokuapp.com/).

> Note: because we are still using http in API endpoint, so http is required to visit Heroku.


## Development

```sh
$ make watch
$ curl http://localhost:8080/
```

## License

WeFlex Copyright

