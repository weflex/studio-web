# source files
sources  = $(shell find app -name '*.js*')
styles   = $(shell find app -name '*.css')
servekit = $(shell find server -type f)

# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'
watchman-make = '/usr/local/bin/watchman-make'


# trigger static build
build: dist/bundle.js dist/index.html dist/fonts


# generate files required for heroku branch
heroku: build $(servekit)


# start a server at localhot:8080
serve: build $(servekit)
	@make -C dist $@

# start a server and watch changes on file-system
watch: serve
	$(watchman-make) \
	  -p 'app/*' 'app/**/*' -t 'build'

# drop static build
clean: dist
	@rm -rf $<

# drop static build and all the dependencies installed
purge: node_modules clean
	@rm -rf $<
	@make -C server $@

dist/index.html: app/index.html dist
	@cp $< $@

dist/fonts: app/fonts dist
	@cp -r $< $@

$(servekit): server dist
	@cp $@ $(patsubst server%,dist%,$@)

dist/bundle.js: $(sources) $(styles) node_modules dist
	node_modules/.bin/webpack

node_modules: package.json
	$(npm) install

dist:
	@mkdir $@

.PHONY: build heroku serve watch clean purge
