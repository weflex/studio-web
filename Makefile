# source files
sources  = $(shell find app -name '*.js*')
styles   = $(shell find app -name '*.css')
servekit = \
	dist/Makefile \
	dist/Procfile \
	dist/package.json \
	dist/server.js
assets   = \
	dist/index.html \
	dist/favicon.ico \
	dist/fonts \
	dist/apple-touch-icon.png

# build dependencies
node    = '/usr/local/bin/node'
npm     = '/usr/local/bin/npm'
webpack = 'node_modules/.bin/webpack'


# trigger static build
build: dist/bundle.js $(assets)


# generate files required for heroku branch
heroku: build $(servekit)


# start a server at localhot:8080
serve: build $(servekit)
	@make -C dist $@

# start a server and watch changes on file-system
watch: serve
	$(webpack) --watch

# drop static build
clean: dist
	@rm -rf $<

# drop static build and all the dependencies installed
purge: node_modules clean
	@rm -rf $<
	@make -C server $@

$(assets): $(patsubst dist/%,app/%,$(assets)) dist
	@cp -r $(patsubst dist/%,app/%,$@) $@

$(servekit): $(patsubst dist/%,server/%,$(servekit)) dist
	@cp $(patsubst dist/%,server/%,$@) $@

dist/bundle.js: $(sources) $(styles) node_modules dist
	$(webpack) -p

node_modules: package.json
	$(npm) install

dist:
	@mkdir $@

.PHONY: build heroku serve watch clean purge
