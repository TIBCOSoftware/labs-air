package transforms

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"github.com/Shopify/sarama"
	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
)

// todo core should add support for shared connections and replace this
var connections = make(map[string]*KafkaConnection)

type KafkaConfig struct {
	BrokerUrls string
	TrustStore string
	User       string
	Password   string
	Topic      string
}

type KafkaConnection struct {
	kafkaConfig  *sarama.Config
	brokers      []string
	syncProducer sarama.SyncProducer
}

// KafkaSender ...
type KafkaSender struct {
	conn  *KafkaConnection
	topic string
}

func (c *KafkaConnection) Connection() sarama.SyncProducer {
	return c.syncProducer
}

func (c *KafkaConnection) Stop() error {
	return c.syncProducer.Close()
}

func getConnectionKey(settings *KafkaConfig) string {

	var connKey string

	connKey += settings.BrokerUrls
	if settings.TrustStore != "" {
		connKey += settings.TrustStore
	}
	if settings.User != "" {
		connKey += settings.User
	}

	return connKey
}

func getKafkaConnection(settings *KafkaConfig) (*KafkaConnection, error) {

	connKey := getConnectionKey(settings)

	if conn, ok := connections[connKey]; ok {
		loggingClient.Debug("Reusing cached Kafka connection [%s]", connKey)
		return conn, nil
	}

	newConn := &KafkaConnection{}

	newConn.kafkaConfig = sarama.NewConfig()
	newConn.kafkaConfig.Producer.Return.Errors = true
	newConn.kafkaConfig.Producer.RequiredAcks = sarama.WaitForAll
	newConn.kafkaConfig.Producer.Retry.Max = 5
	newConn.kafkaConfig.Producer.Return.Successes = true

	brokerUrls := strings.Split(settings.BrokerUrls, ",")

	if len(brokerUrls) < 1 {
		return nil, fmt.Errorf("BrokerUrl [%s] is invalid, require at least one broker", settings.BrokerUrls)
	}

	brokers := make([]string, len(brokerUrls))

	for brokerNo, broker := range brokerUrls {
		err := validateBrokerUrl(broker)
		if err != nil {
			return nil, fmt.Errorf("BrokerUrl [%s] format invalid for reason: [%v]", broker, err)
		}
		brokers[brokerNo] = broker
	}

	newConn.brokers = brokers
	loggingClient.Debug("Kafka brokers: [%v]", brokers)

	//clientKeystore
	/*
		Its worth mentioning here that when the keystore for kafka is created it must support RSA keys via
		the -keyalg RSA option.  If not then there will be ZERO overlap in supported cipher suites with java.
		see: https://issues.apache.org/jira/browse/KAFKA-3647
		for more info
	*/
	if settings.TrustStore != "" {
		if trustPool, err := getCerts(settings.TrustStore); err == nil {
			config := tls.Config{
				RootCAs:            trustPool,
				InsecureSkipVerify: true}
			newConn.kafkaConfig.Net.TLS.Enable = true
			newConn.kafkaConfig.Net.TLS.Config = &config

			loggingClient.Debug("Kafka initialized truststore from [%v]", settings.TrustStore)
		} else {
			return nil, err
		}
	}

	// SASL
	if settings.User != "" {
		if len(settings.Password) == 0 {
			return nil, fmt.Errorf("password not provided for user: %s", settings.User)
		}
		newConn.kafkaConfig.Net.SASL.Enable = true
		newConn.kafkaConfig.Net.SASL.User = settings.User
		newConn.kafkaConfig.Net.SASL.Password = settings.Password
		loggingClient.Debug("Kafka SASL params initialized; user [%v]", settings.User)
	}

	syncProducer, err := sarama.NewSyncProducer(newConn.brokers, newConn.kafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create a Kafka SyncProducer.  Check any TLS or SASL parameters carefully.  Reason given: [%s]", err)
	}

	newConn.syncProducer = syncProducer
	connections[connKey] = newConn
	loggingClient.Debug("Caching Kafka connection [%s]", connKey)

	return newConn, nil
}

// validateBrokerUrl ensures that this string meets the host:port definition of a kafka host spec
// Kafka calls it a url but its really just host:port, which for numeric ip addresses is not a valid URI
// technically speaking.
func validateBrokerUrl(broker string) error {
	hostPort := strings.Split(broker, ":")
	if len(hostPort) != 2 {
		return fmt.Errorf("BrokerUrl must be composed of sections like \"host:port\"")
	}
	i, err := strconv.Atoi(hostPort[1])
	if err != nil || i < 0 || i > 32767 {
		return fmt.Errorf("port specification [%s] is not numeric and between 0 and 32767", hostPort[1])
	}
	return nil
}

func getCerts(trustStore string) (*x509.CertPool, error) {
	certPool := x509.NewCertPool()

	fileInfo, err := os.Stat(trustStore)
	if err != nil {
		return certPool, fmt.Errorf("Truststore [%s] does not exist", trustStore)
	}

	switch mode := fileInfo.Mode(); {
	case mode.IsDir():
		break
	case mode.IsRegular():
		return certPool, fmt.Errorf("TrustStore [%s] is not a directory.  Must be a directory containing trusted certificates in PEM format",
			trustStore)
	}

	trustedCertFiles, err := ioutil.ReadDir(trustStore)
	if err != nil || len(trustedCertFiles) == 0 {
		return certPool, fmt.Errorf("failed to read trusted certificates from [%s]  Must be a directory containing trusted certificates in PEM format", trustStore)
	}

	for _, trustCertFile := range trustedCertFiles {
		fqfName := fmt.Sprintf("%s%c%s", trustStore, os.PathSeparator, trustCertFile.Name())
		trustCertBytes, err := ioutil.ReadFile(fqfName)
		if err != nil {
			loggingClient.Warn("Failed to read trusted certificate [%s] ... continuing", trustCertFile.Name())
		} else if trustCertBytes != nil {
			certPool.AppendCertsFromPEM(trustCertBytes)
		}
	}

	if len(certPool.Subjects()) < 1 {
		return certPool, fmt.Errorf("failed to read trusted certificates from [%s]  After processing all files in the directory no valid trusted certs were found", trustStore)
	}

	return certPool, nil
}

// LoadKafkaConfig Loads the kafka configuration necessary to connect to Kafka
func LoadKafkaConfig(sdk *appsdk.AppFunctionsSDK) (*KafkaConfig, error) {
	if sdk == nil {
		return nil, errors.New("Invalid AppFunctionsSDK")
	}

	loggingClient = sdk.LoggingClient

	var brokerUrls, user, password, trustStore, topic string

	appSettings := sdk.ApplicationSettings()
	if appSettings != nil {
		brokerUrls = getAppSetting(appSettings, "KafkaBrokerUrl")
		user = getAppSetting(appSettings, "KafkaUser")
		password = getAppSetting(appSettings, "KafkaPassword")
		trustStore = getAppSetting(appSettings, "KafkaTrustStore")
		topic = getAppSetting(appSettings, "KafkaTopic")
	} else {
		return nil, errors.New("No application-specific settings found")
	}

	config := KafkaConfig{}

	config.BrokerUrls = brokerUrls
	config.User = user
	config.Password = password
	config.TrustStore = trustStore
	config.Topic = topic

	return &config, nil
}

// NewKafkaSender creates, initializes and returns a new instance of KafkaSender
func NewKafkaSender(logging logger.LoggingClient, config *KafkaConfig) *KafkaSender {

	conn, err := getKafkaConnection(config)
	if err != nil {
		loggingClient.Error(fmt.Sprintf("getKafkaConnection got error %s", err.Error()))

		return nil
	}

	return &KafkaSender{
		conn:  conn,
		topic: config.Topic,
	}
}

// KafkaSend will send data from the previous function to the specified Endpoint via Kafka.
// If no previous function exists, then the event that triggered the pipeline will be used.
// An empty string for the mimetype will default to application/json.
func (sender KafkaSender) KafkaSend(msg string) (bool, interface{}) {

	loggingClient.Info(fmt.Sprintf("KafkaSend event: "))

	prdmsg := &sarama.ProducerMessage{
		Topic: sender.topic,
		Value: sarama.StringEncoder(msg),
	}

	partition, offset, err := sender.conn.Connection().SendMessage(prdmsg)
	if err != nil {
		loggingClient.Info(fmt.Sprintf("Error sending event: "))
		return false, fmt.Errorf("failed to send Kakfa message for reason [%s]", err.Error())
	}

	loggingClient.Debug(fmt.Sprintf("Kafka message [%v] sent successfully on partition [%d] and offset [%d]", msg, partition, offset))

	return true, nil

}
