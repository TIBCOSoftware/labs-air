.PHONY: build test clean docker

GO=CGO_ENABLED=1 GO111MODULE=on go

MICROSERVICES=cmd/support-flogo-rules
.PHONY: $(MICROSERVICES)

VERSION=$(shell cat ./VERSION)

GOFLAGS=-ldflags "-X github.com/TIBCOSoftware/labs-air/edgexfoundry/support-flogo-rules.Version=$(VERSION)"
GIT_SHA=$(shell git rev-parse HEAD)

build: $(MICROSERVICES)
	$(GO) install -tags=safe

cmd/support-flogo-rules:
	$(GO) build $(GOFLAGS) -o $@ ./cmd

docker:
	docker build \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-support-flogo-rules:$(VERSION) \
		.


dockerarm64:
	docker build \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-support-flogo-rules-arm64:$(VERSION) --push \
		.

dockerbuildxarm64:
	docker buildx build \
		--platform linux/arm64 \
		--label "git_sha=$(GIT_SHA)" \
		-t magallardo/docker-support-flogo-rules-arm64:$(VERSION) --push \
		.

test:
	$(GO) vet ./...
	gofmt -l .
	$(GO) test -coverprofile=coverage.out ./...

clean:
	rm -f $(MICROSERVICES)
