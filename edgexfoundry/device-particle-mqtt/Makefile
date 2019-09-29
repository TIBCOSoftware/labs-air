.PHONY: build test clean prepare update docker

GO = CGO_ENABLED=0 GO111MODULE=on go

MICROSERVICES=cmd/device-particle-mqtt

.PHONY: $(MICROSERVICES)

DOCKERS=docker_device_particle_mqtt

.PHONY: $(DOCKERS)

VERSION=$(shell cat ./VERSION)
GIT_SHA=$(shell git rev-parse HEAD)

GOFLAGS=-ldflags "-X github.com/TIBCOSoftware/labs-air/edgexfoundry/device-particle-mqtt.Version=$(VERSION)"

build: $(MICROSERVICES)
	$(GO) build ./...

cmd/device-particle-mqtt:
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
		-t magallardo/docker-device-particle-mqtt:$(VERSION) \
		.
