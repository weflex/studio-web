directories = \
	dist \
	dist/login

develop: node_modules
	@make -f build/develop.mk

watch: serve
	@make -f build/develop.mk watch

production: node_modules
	@make -f build/production.mk

# start a server at localhot:8080
serve: dist/server.mk
	@make -C dist -f server.mk $@

# build for electron
electron: dist/electron.mk
	@make -C dist -f electron.mk

# drop static build
clean: $(directories)
	@rm -rf $<

dist/server.mk: build/server/Makefile dist
	@cp $< $@

dist/electron.mk: build/electron/Makefile clean
	@make dist
	@cp $< $@

node_modules: package.json
	@PATH=$(PATH) npm install

$(directories):
	@mkdir -p $@

.PHONY: develop watch production serve electron electron-win32 electron-win64 clean
