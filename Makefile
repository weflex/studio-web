# source files
sources = $(shell find app -name '*.js*')
styles  = $(shell find app -name '*.css')

# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'
watchman-make = '/usr/local/bin/watchman-make'

build: dist/bundle.js dist/index.html dist/style.css dist/common dist/fonts dist/server

watch: serve
	$(watchman-make) \
	  -p 'app/*' 'app/**/*' -t 'build'

dist/server: dist
	@cp -r server/* dist/

dist/index.html: app/index.html dist
	@cp $< $@

dist/style.css: $(styles) dist
	@cat $(styles) > $@
	@touch dist/index.html

dist/fonts: dist
	@cp -r app/fonts $</

dist/bundle.js: app/index.jsx $(sources) node_modules dist
	node_modules/.bin/webpack

serve: build
	@cd ./dist && \
		$(node) ./server.js > .server.log &
	@echo
	@echo ["\033[32mINFO\033[0m"] server is up and running at localhost:8080
	@echo

node_modules: package.json
	$(npm) install

clean: dist
	@rm -rf $<

purge: node_modules clean
	@rm -rf $<

dist:
	@mkdir $@

dist/common: node_modules dist
	@cp -r node_modules/fixed-data-table/dist $@

.PHONY: build clean watch serve
