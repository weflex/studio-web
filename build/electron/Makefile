assets  = \
	index.html \
	login.html \
	main.js \
	package.json

electron = '/usr/local/bin/electron-packager'

ELECTRON_MIRROR = https://npm.taobao.org/mirrors/electron


build: $(assets)
	$(electron) . studio \
	  --icon apple-touch-icon \
	  --platform=darwin \
	  --arch=x64 \
	  --version=0.36.7 \
	  --overwrite

node_modules: package.json
	@npm install

%: ../build/electron/%
	@cp $< $@

.PHONY: build
