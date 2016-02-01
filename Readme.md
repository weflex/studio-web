# Studio-Web

The desktop(HD) application for Studio based on Web and the following stacks:

- React
- Webpack and Makefile to build apps
- Heroku to deploy for demo

![v1.0](./history/v1.0.png)

## Build

### Build Dependencies

* NodeJS (>= 5.0.0) See [Official Repo](https://nodejs.org/en/download/)
* Make

* GNU Make 3.81

### Generating Static Builds

To make a static build, simply

```
$ make
```

To deploy to [Heroku Endpoint](http://weflex-admin.herokuapp.com/).

> Note: because we are still using http in API endpoint, so http is required to visit Heroku.

## Run

To start a http server, simply

```
> make watch
```

this will start a server listening on port 8080. Even better, any
change you made will trigger a rebuild and reload the web page :).

## Components

- For `touchable-tabular`, please visit: [react-touchable-tabular](https://github.com/weflex/react-touchable-tabular)
- For `toolbar`, please visit: [app/toolbar](./app/toolbar)

> Every components should be planed to open its source to improve with the other React and React-Native communities.

## License

WeFlex Copyright

