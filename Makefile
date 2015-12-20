# source files
sources = $(shell find app -name '*.js')
styles  = $(shell find app -name '*.css')

# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'
watchman-make = '/usr/local/bin/watchman-make'

build: dist/bundle.js dist/index.html dist/style.css dist/common dist/fonts

watch: serve
	$(watchman-make) \
	  -p 'app/*' 'app/**/*' -t 'build'

dist/index.html: app/index.html dist
	@cp $< $@

dist/style.css: $(styles) dist
	@cat $(styles) > $@
	@touch dist/index.html

dist/fonts: dist
	@cp -r app/fonts $</

dist/bundle.js: app/index.js $(sources) node_modules dist
	node_modules/.bin/browserify \
	  --transform [ babelify \
	    --plugins [ transform-react-jsx syntax-flow ] \
	    --presets [ es2015 \
	                stage-0 \
	                stage-1 \
	                stage-2 \
	                stage-3 ] ] \
	  $< -o $@

serve: build
	$(node) server.js > .server.log &
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
