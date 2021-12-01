WD=$(shell pwd)


_PORT=8080
ifneq (,$(PORT))
	_PORT=$(PORT)
endif

run:
	docker run \
		-p $(_PORT):8080 \
		sinashk/websocket:latest

run-deflate:
	docker run \
		-p $(_PORT):8080 \
		-e MESSAGE_DEFLATE=true \
		sinashk/websocket:latest	

build-run:
	yarn install
	yarn start

build-run-deflate:
	yarn install
	MESSAGE_DEFLATE=true yarn start

doc:
	pandoc -f markdown-implicit_figures \
		-f gfm --highlight-style=breezedark \
		-o document.pdf README.md

help:
	@echo to create a pdf document out of markdown run make doc
	@echo to run without compression
	@echo PORT=1 make run
	@echo 1 is host_port. default is 8080
	@echo example:
	@echo PORT=8080 make run
	@echo to run with compression
	@echo PORT=1 make run-deflate
	@echo 1 is host_port. default is 8080
	@echo example:
	@echo PORT=8080 make run-deflate
