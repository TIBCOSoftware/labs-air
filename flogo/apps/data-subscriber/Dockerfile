FROM alpine:3.7

RUN mkdir /iot

COPY IotDataSubscriberMQTT-Gateway1-K8-linux_amd64 /iot

RUN chmod +x /iot/IotDataSubscriberMQTT-Gateway1-K8-linux_amd64

ENTRYPOINT ["/iot/IotDataSubscriberMQTT-Gateway1-K8-linux_amd64"]