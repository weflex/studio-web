assets  = \
	icon.icns \
	main.js \
	package.json

electron = '/usr/local/bin/electron-packager'

platform ?= 'darwin'
arch     ?= 'x64'

ELECTRON_MIRROR = https://npm.taobao.org/mirrors/electron

build: $(assets) node_modules
	$(electron) . studio \
	  --platform=$(platform) \
	  --arch=$(arch) \
	  --icon=icon.icns \
	  --version=0.36.7 \
	  --overwrite

node_modules: package.json
	@npm install

%: ../build/electron/%
	@cp $< $@

.PHONY: build
