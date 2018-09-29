.PHONY: default run build shell

default: run

DOCKER_CMD=docker run -it --rm -p 3000:3000 -p 3001:3001 -v $$PWD:/app

build:
	docker build -t photoalbum:latest .

run:
	$(DOCKER_CMD) photoalbum:latest

shell:
	$(DOCKER_CMD) photoalbum:latest bash

