.PHONY: build test clean prepare update docker

GO = CGO_ENABLED=1 GO111MODULE=on go

MICROSERVICES=cmd/device-stm32l4r9-blegatt
.PHONY: $(MICROSERVICES)

DOCKERS=docker_device_particle_mqtt
.PHONY: $(DOCKERS)

VERSION=$(shell cat ./VERSION)
GIT_SHA=$(shell git rev-parse HEAD)

GOFLAGS=-ldflags "-X github.com/TIBCOSoftware/labs-air/edgexfoundry/device-stm32l4r9-blegatt.Version=$(VERSION)"

build: $(MICROSERVICES)
	$(GO) build ./...

cmd/device-stm32l4r9-blegatt:
	$(GO) build $(GOFLAGS) -o $@ ./cmd

test:
	$(GO) test ./... -cover

clean:
	rm -f $(MICROSERVICES)

run:
	cd bin && ./edgex-launch.sh

docker: $(DOCKERS)

docker_device_particle_mqtt:
	docker build \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-device-stm32l4r9-blegatt:$(VERSION) \
		.

dockerarm64:
	docker build \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-device-stm32l4r9-blegatt-arm64:$(VERSION) \
		.

dockerbuildxarm64:
	docker buildx build \
		--platform linux/arm64 \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-device-stm32l4r9-blegatt-arm64:$(VERSION) \
		.

