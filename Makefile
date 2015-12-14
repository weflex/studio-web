# source files
sources = $(shell find app -name '*.js')
styles  = $(shell find app -name '*.css')

# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'
watchman      = '/usr/local/bin/watchman'
watchman-make = '/usr/local/bin/watchman-make'

build: dist/bundle.js dist/index.html dist/style.css dist/fonts

watch: serve
	$(watchman-make) \
	  -p 'app/*' 'app/**/*' -t 'build'

dist/index.html: app/index.html dist
	@cp $< $@

dist/style.css: $(styles) dist
	@cat $< > $@

dist/fonts: dist
	@cp -r app/fonts $</

dist/bundle.js: app/index.js $(sources) node_modules dist
	node_modules/.bin/browserify \
	  --transform [ babelify \
	    --plugins [ transform-react-jsx ] \
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

dist:
	@mkdir $@

.PHONY: build clean watch serve
