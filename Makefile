# source files
sources  = $(shell find app -name '*.js*')
styles   = $(shell find app -name '*.css')
assets   = \
	dist/favicon.ico \
	dist/fonts/ \
	dist/apple-touch-icon.png
entraces = \
	dist/index.html \
	dist/login/index.html
dirs    = dist dist/login
outputs = \
	dist/app.js \
	dist/login/index.js
electron_mirror = \
	https://npm.taobao.org/mirrors/electron

# build dependencies
node      = '/usr/local/bin/node'
npm       = '/usr/local/bin/npm'
webpack   = 'node_modules/.bin/webpack'
electron  = '/usr/local/bin/electron-packager'

# trigger static build
build: $(outputs) $(assets) node_modules

# generate files required for heroku branch
heroku: build dist/Makefile $(entraces)
	@make -C dist $@

# start a server at localhot:8080
serve: dist/Makefile $(entraces)
	@make -C dist $@

# start a server and watch changes on file-system
watch: serve build
	$(webpack) --watch

# build for electron
electronprebuild: clean

electron: build
	cp -r ./build/electron/ ./dist/
	cd ./dist && npm install
	ELECTRON_MIRROR=$(electron_mirror) $(electron) \
		./dist studio \
		--out dist-electron \
		--icon apple-touch-icon.png \
		--platform=darwin \
		--arch=x64 \
		--version=0.36.7 \
		--overwrite

# drop static build
clean: dist
	@rm -rf $<

# drop static build and all the dependencies installed
purge: node_modules clean
	@rm -rf $<
	@make -C server $@

$(assets): $(patsubst dist/%,app/%,$(assets)) $(dirs)
	@cp -R $(patsubst dist/%,app/%,$@) $@

dist/Makefile: build/server/Makefile dist
	@cp $< $@

dist/%.html: build/server/%.html $(dirs)
	@cp $< $@

$(outputs): $(sources) $(styles) node_modules $(dirs)
	$(webpack) -p

node_modules: package.json
	$(npm) install

$(dirs):
	@mkdir -p $@

.PHONY: build heroku serve watch clean purge
