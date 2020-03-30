package transforms

import (
	"crypto/tls"
	"errors"
	"fmt"
	"strings"

	MQTT "github.com/eclipse/paho.mqtt.golang"
	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/app-functions-sdk-go/pkg/util"
	"github.com/edgexfoundry/go-mod-core-contracts/clients"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
)

// MQTTConfig contains mqtt client parameters
type MQTTConfig struct {
	Protocol      string
	Hostname      string
	Port          string
	TrustStore    string
	User          string
	Password      string
	Publisher     string
	Topic         string
	QOS           byte
	Retain        bool
	AutoReconnect bool
}

// KeyCertPair is used to pass key/cert pair to NewMQTTSender
// KeyPEMBlock and CertPEMBlock will be used if they are not nil
// then it will fall back to KeyFile and CertFile
type KeyCertPair struct {
	KeyFile      string
	CertFile     string
	KeyPEMBlock  []byte
	CertPEMBlock []byte
}

// MQTTSender ...
type MQTTSender struct {
	client MQTT.Client
	topic  string
	opts   MQTTConfig
}

// LoadMQTTConfig Loads the MQTT configuration necessary to connect to MQTT
func LoadMQTTConfig(sdk *appsdk.AppFunctionsSDK) (*MQTTConfig, error) {
	if sdk == nil {
		return nil, errors.New("Invalid AppFunctionsSDK")
	}

	loggingClient = sdk.LoggingClient

	var protocol, host, port, publisher, user, password, trustStore, topic string

	appSettings := sdk.ApplicationSettings()
	if appSettings != nil {
		protocol = getAppSetting(appSettings, "MqttProtocol")
		host = getAppSetting(appSettings, "MqttHostname")
		port = getAppSetting(appSettings, "MqttPort")
		publisher = getAppSetting(appSettings, "MqttPublisher")
		user = getAppSetting(appSettings, "MqttUser")
		password = getAppSetting(appSettings, "MqttPassword")
		trustStore = getAppSetting(appSettings, "MqttTrustStore")
		topic = getAppSetting(appSettings, "MqttTopic")
	} else {
		return nil, errors.New("No application-specific settings found")
	}

	config := MQTTConfig{}

	config.Protocol = protocol
	config.Hostname = host
	config.Port = port
	config.Publisher = publisher
	config.User = user
	config.Password = password
	config.TrustStore = trustStore
	config.Topic = topic
	config.QOS = 0
	config.Retain = false
	config.AutoReconnect = false

	return &config, nil
}

// SetRetain enables or disables mqtt retain option
func (mqttConfig MQTTConfig) SetRetain(retain bool) {
	mqttConfig.Retain = retain
}

// SetQos changes mqtt qos(0,1,2) for all messages
func (mqttConfig MQTTConfig) SetQos(qos byte) {
	mqttConfig.QOS = qos
}

// SetAutoreconnect enables or disables the automatic client reconnection to broker
func (mqttConfig MQTTConfig) SetAutoreconnect(reconnect bool) {
	mqttConfig.AutoReconnect = reconnect
}

// NewMQTTSender creates, initializes and returns a new instance of MQTTSender
func NewMQTTSender(logging logger.LoggingClient, keyCertPair *KeyCertPair, mqttConfig *MQTTConfig) *MQTTSender {
	protocol := strings.ToLower(mqttConfig.Protocol)

	opts := MQTT.NewClientOptions()
	broker := protocol + "://" + mqttConfig.Hostname + ":" + mqttConfig.Port
	opts.AddBroker(broker)
	opts.SetClientID(mqttConfig.Publisher)
	opts.SetUsername(mqttConfig.User)
	opts.SetPassword(mqttConfig.Password)
	opts.SetAutoReconnect(mqttConfig.AutoReconnect)

	if (protocol == "tcps" || protocol == "ssl" || protocol == "tls") && keyCertPair != nil {
		var cert tls.Certificate
		var err error

		if keyCertPair.KeyPEMBlock != nil && keyCertPair.CertPEMBlock != nil {
			cert, err = tls.X509KeyPair(keyCertPair.CertPEMBlock, keyCertPair.KeyPEMBlock)
		} else {
			cert, err = tls.LoadX509KeyPair(keyCertPair.CertFile, keyCertPair.KeyFile)
		}

		if err != nil {
			logging.Error("Failed loading x509 data")
			return nil
		}

		tlsConfig := &tls.Config{
			ClientCAs:          nil,
			InsecureSkipVerify: true,
			Certificates:       []tls.Certificate{cert},
		}

		opts.SetTLSConfig(tlsConfig)

	}

	sender := &MQTTSender{
		client: MQTT.NewClient(opts),
		topic:  mqttConfig.Topic,
		opts:   *mqttConfig,
	}

	return sender
}

// MQTTSend will send data from the previous function to the specified Endpoint via MQTT.
// If no previous function exists, then the event that triggered the pipeline will be used.
// An empty string for the mimetype will default to application/json.
func (sender MQTTSender) MQTTSend(msg string) (bool, interface{}) {
	loggingClient.Info("Sending Notification")
	loggingClient.Debug(fmt.Sprintf("Message: [%s]\n", msg))

	if !sender.client.IsConnected() {
		loggingClient.Info("Connecting to mqtt server")
		if token := sender.client.Connect(); token.Wait() && token.Error() != nil {
			return false, fmt.Errorf("Could not connect to mqtt server, drop event. Error: %s", token.Error().Error())
		}
		loggingClient.Info("Connected to mqtt server")
	}
	data, err := util.CoerceType(msg)
	if err != nil {
		return false, err
	}
	token := sender.client.Publish(sender.topic, sender.opts.QOS, sender.opts.Retain, data)
	// FIXME: could be removed? set of tokens?
	token.Wait()
	if token.Error() != nil {
		return false, token.Error()
	}
	loggingClient.Info("Sent data to MQTT Broker")
	loggingClient.Trace("Data exported", "Transport", "MQTT", clients.CorrelationHeader)

	return true, nil
}
