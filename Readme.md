WeFlex Admin Web App
====================

Build Dependencies
------------------

* NodeJS (>= 5.0.0)

See [Official Repo](https://nodejs.org/en/download/)

* Watchman (>= 4.1.0)

````
> brew update && brew install --HEAD watchman
````

* Make


Generating Static Builds
-------------

To make a static build, simply

````
> make
````

or alternatively, you could use gulp

````
> gulp
````


Start a Server
--------------

To start a http server, simply

````
> make watch
````

this will start a server listening on port 8080. Even better, any
change you made will trigger a rebuild and reload the web page :).
