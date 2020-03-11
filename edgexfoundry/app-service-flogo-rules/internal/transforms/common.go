package transforms

import (
	"fmt"

	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
)

var loggingClient logger.LoggingClient
var kafkaSender *KafkaSender
var mqttSender *MQTTSender
var httpSender *HTTPSender
var senderTransport string

func getAppSetting(settings map[string]string, name string) string {
	value, ok := settings[name]

	if ok {
		loggingClient.Info(fmt.Sprintf("Setting for %s: %s", name, value))
		return value
	}
	loggingClient.Error(fmt.Sprintf("ApplicationName application setting %s not found", name))
	return ""

}

// SetNotificationsSender - sets the sender for the provided transport
func SetNotificationsSender(sdk *appsdk.AppFunctionsSDK, transport string) (bool, interface{}) {
	senderTransport = transport
	if senderTransport == "Kafka" {
		setKafkaSender(sdk)
		return true, nil
	} else if senderTransport == "MQTT" {
		setMQTTSender(sdk)
		return true, nil
	} else {
		return false, fmt.Errorf("Failed to set sender. Invalid Transport")
	}
}

// SendNotification - sends message on the configured transport
func SendNotification(msg string) (bool, interface{}) {
	if senderTransport == "Kafka" {
		return kafkaSender.KafkaSend(msg)
	} else if senderTransport == "MQTT" {
		return mqttSender.MQTTSend(msg)
	} else {
		return false, fmt.Errorf("Failed to send message. Invalid Transport")
	}
}

// SetKafkaSender - sets the kafka sender
func setKafkaSender(sdk *appsdk.AppFunctionsSDK) {

	kafkaConfig, _ := LoadKafkaConfig(sdk)

	kafkaSender = NewKafkaSender(sdk.LoggingClient, kafkaConfig)

}

// SetMQTTSender - sets the mqtt sender
func setMQTTSender(sdk *appsdk.AppFunctionsSDK) {

	mqttConfig, _ := LoadMQTTConfig(sdk)

	// pair := transforms.KeyCertPair{
	// 	KeyFile:  "PATH_TO_YOUR_KEY_FILE",
	// 	CertFile: "PATH_TO_YOUR_CERT_FILE",
	// }

	mqttSender = NewMQTTSender(sdk.LoggingClient, nil, mqttConfig)

}

// SetHTTPSender - sets the http sender
func SetHTTPSender(url string, mineType string, persistOnError bool) {

	httpSender = NewHTTPSender(url, mineType, persistOnError)

}
