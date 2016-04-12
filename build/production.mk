assets  = \
	dist/favicon.ico
entraces = \
	dist/index.html \
	dist/login/index.html \
  dist/signup/index.html
directories = \
	dist \
	dist/login \
  dist/signup

PATH := /usr/local/bin:$(PATH)
PATH := $(shell pwd)/node_modules/.bin:$(PATH)

build: $(assets) $(entraces) node_modules $(directories)
	@PATH=$(PATH) GIAN_GATEWAY=prod webpack -p

dist/%.html: build/production/%.html $(directories)
	@cp $< $@

dist/%: build/% dist
	@cp $< $@

$(directories):
	@mkdir -p $@

.PHONY: build
