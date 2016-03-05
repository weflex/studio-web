# source files
sources = $(shell find app -name '*.js*')
styles  = $(shell find app -name '*.css')
assets  = \
	dist/favicon.ico
entraces = \
	dist/index.html \
	dist/login/index.html
directories = \
	dist \
	dist/login
outputs = \
	dist/app.js \
	dist/login/index.js

# build dependencies
PATH := /usr/local/bin:$(PATH)
PATH := $(shell pwd)/node_modules/.bin:$(PATH)

# trigger static build
build: $(outputs) $(assets) $(entraces) node_modules

$(outputs): $(sources) $(styles) node_modules $(directories)
	@PATH=$(PATH) webpack

dist/%.html: build/develop/%.html $(directories)
	@cp $< $@

dist/%: build/% dist
	@cp $< $@

$(directories):
	@mkdir -p $@

watch: $(assets) $(entraces) node_modules
	@PATH=$(PATH) webpack --watch

.PHONY: build watch
