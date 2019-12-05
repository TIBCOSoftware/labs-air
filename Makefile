SCRIPTS_PATH      := scripts

.PHONY: build-push-air-subscriber-gateway
build-push-air-subscriber-gateway:
	@$(SCRIPTS_PATH)/build_push_air_subscriber_gateway.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: build-push-air-notifications-gateway
build-push-air-notifications-gateway:
	@$(SCRIPTS_PATH)/build_push_air_notifications_gateway.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}

.PHONY: build-push-air-ui
build-push-air-ui:
	@$(SCRIPTS_PATH)/build_push_air_ui.sh ${IMAGE_NAME} ${IMAGE_TAG} ${IMAGE_URL}
