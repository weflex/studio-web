# source files
sources = $(shell find app -name '*.js*')
styles  = $(shell find app -name '*.css')
assets  = \
	dist/favicon.ico \
	dist/fonts/ \
	dist/apple-touch-icon.png

entraces = \
	dist/index.html \
	dist/login/index.html

dirs    = \
	dist \
	dist/login

outputs = \
	dist/app.js \
	dist/login/index.js

electron_mirror = \
	https://npm.taobao.org/mirrors/electron

# build dependencies
PATH := /usr/local/bin:$(PATH)
PATH := $(shell pwd)/node_modules/.bin:$(PATH)

electron  = '/usr/local/bin/electron-packager'

# trigger static build
build: $(outputs) $(assets) node_modules

# generate files required for heroku branch
heroku: build dist/Makefile $(entraces)
	@make -C dist $@

# start a server at localhot:8080
serve: dist/server.mk $(entraces)
	@make -C dist -f server.mk $@

# start a server and watch changes on file-system
watch: serve build
	@PATH=$(PATH) webpack --watch

# build for electron
electron: dist/electron.mk
	@make build
	@make -C dist -f electron.mk

electron-win32: dist/electron.mk
	@make build
	@make -C dist -f electron.mk platform=win32 arch=ia32

electron-win64: dist/electron.mk
	@make build
	@make -C dist -f electron.mk platform=win32 arch=x64

# drop static build
clean: dist
	@rm -rf $<

# drop static build and all the dependencies installed
purge: node_modules clean
	@rm -rf $<
	@make -C server $@

$(assets): $(patsubst dist/%,app/%,$(assets)) $(dirs)
	@cp -R $(patsubst dist/%,app/%,$@) $@

dist/server.mk: build/server/Makefile dist
	@cp $< $@

dist/electron.mk: build/electron/Makefile clean
	@make dist
	@cp $< $@

dist/%.html: build/server/%.html $(dirs)
	@cp $< $@

$(outputs): $(sources) $(styles) node_modules $(dirs)
	@PATH=$(PATH) webpack -p

node_modules: package.json
	@npm install

$(dirs):
	@mkdir -p $@

.PHONY: build heroku serve watch clean purge
