assets  = \
	dist/favicon.ico
entraces = \
	dist/index.html \
	dist/login/index.html
directories = \
	dist \
	dist/login

PATH := /usr/local/bin:$(PATH)
PATH := $(shell pwd)/node_modules/.bin:$(PATH)

build: $(assets) $(entraces) node_modules $(directories)
	@PATH=$(PATH) webpack -p

dist/%.html: build/production/%.html $(directories)
	@cp $< $@

dist/%: build/% dist
	@cp $< $@

$(directories):
	@mkdir -p $@

.PHONY: build
