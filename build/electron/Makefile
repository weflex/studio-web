assets  = \
	build.js \
	main.js \
	menu.js \
	package.json \
	icon.icns \
	background.png \

ELECTRON_MIRROR = "https://npm.taobao.org/mirrors/electron/"

build: $(assets) node_modules
	@ELECTRON_MIRROR=$(ELECTRON_MIRROR) node ./build.js

node_modules: package.json
	@npm install

%: ../build/electron/%
	@cp $< $@

.PHONY: build
