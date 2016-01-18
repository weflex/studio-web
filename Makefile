# source files
sources  = $(shell find app -name '*.js*')
styles   = $(shell find app -name '*.css')
assets   = \
	dist/index.html \
	dist/favicon.ico \
	dist/fonts \
	dist/login/index.html \
	dist/apple-touch-icon.png
dirs    = \
	dist \
	dist/login
outputs = \
	dist/bundle.js \
	dist/login/index.js

# build dependencies
node    = '/usr/local/bin/node'
npm     = '/usr/local/bin/npm'
webpack = 'node_modules/.bin/webpack'


# trigger static build
build: $(outputs) dist/login/index.js $(assets)

# generate files required for heroku branch
heroku: build dist/Makefile
	@make -C dist $@

# start a server at localhot:8080
serve: dist/Makefile
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

$(assets): $(patsubst dist/%,app/%,$(assets)) $(dirs)
	@cp -r $(patsubst dist/%,app/%,$@) $@

dist/Makefile: server/Makefile dist
	@cp $< $@

$(outputs): $(sources) $(styles) node_modules dist
	$(webpack) -p

node_modules: package.json
	$(npm) install

$(dirs):
	@mkdir -p $@

.PHONY: build heroku serve watch clean purge
