# source files
sources = $(shell find app -name '*.js*')
styles  = $(shell find app -name '*.css')

# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'
watchman-make = '/usr/local/bin/watchman-make'

build: dist/bundle.js dist/index.html dist/fonts dist/server

watch: serve
	$(watchman-make) \
	  -p 'app/*' 'app/**/*' -t 'build'

dist/server: dist
	@cp -r server/* dist/

dist/index.html: app/index.html dist
	@cp $< $@

dist/fonts: dist
	@cp -r app/fonts $</

dist/bundle.js: $(sources) $(styles) node_modules dist
	node_modules/.bin/webpack

serve: build
	@make -C server $@

node_modules: package.json
	$(npm) install

clean: dist
	@rm -rf $<

purge: node_modules clean
	@rm -rf $<
	@make -C server $@

dist:
	@mkdir $@

.PHONY: build clean watch serve
