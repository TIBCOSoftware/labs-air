SCRIPTS_PATH      := scripts

.PHONY: build-push-iot-subscriber-gateway
build-push-iot-subscriber-gateway:
	@$(SCRIPTS_PATH)/build_push_iot_subscriber_gateway.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: build-push-iot-notifications-gateway
build-push-iot-notifications-gateway:
	@$(SCRIPTS_PATH)/build_push_iot_notifications_gateway.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: build-push-cloud-starter-ui
build-push-cloud-starter-ui:
	@$(SCRIPTS_PATH)/build_push_cloud_starter_ui.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}
