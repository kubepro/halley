VERSION_DATE := $(shell date +%Y%m%d%H%M%S)
VERSION_COMMIT := $(shell git rev-parse refs/heads/master)
VERSION := $(VERSION_DATE)-$(VERSION_COMMIT)

all: build_and_publish

build_and_publish:
	docker build -t halley .
	docker tag halley kubepro/halley:$(VERSION)
	docker push kubepro/halley:$(VERSION)

