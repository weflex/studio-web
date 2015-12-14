.DEFAULT_GOAL=package

update:
	@git fetch
	@git checkout $(branch)
	@git pull -u origin $(branch)
	@npm install
	@npm update
	@bower --allow-root install
	@bower --allow-root update


package: update
	@grunt snapshot
	@tar -czf admin.tar.gz out


.PHONY: update package
