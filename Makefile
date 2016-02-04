# source files
sources  = $(shell find app -name '*.js*')
styles   = $(shell find app -name '*.css')
assets   = \
	dist/favicon.ico \
	dist/fonts/ \
	dist/apple-touch-icon.png
dirs    = dist
outputs = \
	dist/app.js \
	dist/login.js
electron_mirror = \
	https://npm.taobao.org/mirrors/electron

# build dependencies
node      = '/usr/local/bin/node'
npm       = '/usr/local/bin/npm'
webpack   = 'node_modules/.bin/webpack'
electron  = '/usr/local/bin/electron-packager'

# trigger static build
build: $(outputs) dist/login.js $(assets) node_modules

# generate files required for heroku branch
heroku: build dist/Makefile
	@make -C dist $@

# start a server at localhot:8080
serve: dist/Makefile
	@make -C dist $@

# start a server and watch changes on file-system
watch: serve build
	$(webpack) --watch

# build for electron
electronprebuild:
	rm -rf ./dist

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

$(outputs): $(sources) $(styles) node_modules dist
	$(webpack) -p

node_modules: package.json
	$(npm) install

$(dirs):
	@mkdir -p $@

.PHONY: build heroku serve watch clean purge
