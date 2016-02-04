assets  = \
	index.html \
	login/index.html \
	main.js \
	package.json

electron = '/usr/local/bin/electron-packager'

PATH += '/usr/local/bin'

ELECTRON_MIRROR = https://npm.taobao.org/mirrors/electron


build: $(assets) node_modules
	$(electron) . studio \
	  --icon apple-touch-icon \
	  --platform=darwin \
	  --arch=x64 \
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
