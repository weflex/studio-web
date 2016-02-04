# build dependencies
node          = '/usr/local/bin/node'
npm           = '/usr/local/bin/npm'

serve: node_modules server.js
	$(node) ./server.js > .server.log &
	@echo
	@echo ["\033[32mINFO\033[0m"] server is up and running at localhost:8080
	@echo

heroku: Procfile package.json server.js

node_modules: package.json
	$(npm) install

Procfile: ../build/server/Procfile
	@cp $< $@

package.json: ../build/server/package.json
	@cp $< $@

server.js: ../build/server/server.js
	@cp $< $@

purge: node_modules
	@rm -rf $<

.PHONY: serve kill purge
