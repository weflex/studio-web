assets  = \
	index.html \
	login/index.html \
	main.js \
	package.json

electron = '/usr/local/bin/electron-packager'

platform ?= 'darwin'
arch     ?= 'x64'

export PATH += '/usr/local/bin'

ELECTRON_MIRROR = https://npm.taobao.org/mirrors/electron


build: $(assets) node_modules
	$(electron) . studio \
	  --platform=$(platform) \
	  --arch=$(arch) \
	  --version=0.36.7 \
	  --overwrite

node_modules: package.json
	@npm install

login/%: ../build/electron/login/% login
	@cp $< $@

%: ../build/electron/%
	@cp $< $@

login:
	@mkdir $@

.PHONY: build
