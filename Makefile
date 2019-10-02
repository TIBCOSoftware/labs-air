SCRIPTS_PATH      := scripts

.PHONY: build-push-iot-subscriber-gateway
build-push-iot-subscriber-gateway:
	@$(SCRIPTS_PATH)/build_push_iot_subscriber_gateway.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}
