.PHONY: build test clean prepare update docker

GO = CGO_ENABLED=0 GO111MODULE=on go

MICROSERVICES=cmd/device-siemens-rest
.PHONY: $(MICROSERVICES)

DOCKERS=docker_device_siemens_rest
.PHONY: $(DOCKERS)

VERSION=$(shell cat ./VERSION 2>/dev/null || echo 0.0.0)
GIT_SHA=$(shell git rev-parse HEAD)

GOFLAGS=-ldflags "-X github.com/TIBCOSoftware/labs-air/edgexfoundry/device-siemens-rest.Version=$(VERSION)"

build: $(MICROSERVICES)

cmd/device-siemens-rest:
	$(GO) build $(GOFLAGS) -o $@ ./cmd

test:
	$(GO) test ./... -coverprofile=coverage.out

clean:
	rm -f $(MICROSERVICES)

docker: $(DOCKERS)

docker_device_siemens_rest:
	docker build \
        --build-arg http_proxy \
        --build-arg https_proxy \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-device-siemens-rest:$(VERSION) \
		.
