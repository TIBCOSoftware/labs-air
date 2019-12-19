package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/project-flogo/rules/common/model"

	"github.com/TIBCOSoftware/labs-air/edgexfoundry/support-flogo-rules/internal/rules"
	"github.com/edgexfoundry/app-functions-sdk-go/appcontext"
	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/go-mod-core-contracts/models"
)

const (
	serviceKey = "support-flogo-rules"
)

var rs model.RuleSession

func main() {

	// First thing to do is to create an instance of the EdgeX SDK and initialize it.
	edgexSdk := &appsdk.AppFunctionsSDK{ServiceKey: serviceKey}
	if err := edgexSdk.Initialize(); err != nil {
		edgexSdk.LoggingClient.Error(fmt.Sprintf("SDK initialization failed: %v\n", err))
		os.Exit(-1)
	}

	// Get the application's specific configuration settings.
	appSettings := edgexSdk.ApplicationSettings()
	tupleTypesFilename := ""
	mqttHost := ""
	mqttPortStr := "1883"
	mqttPort := 1883
	mqttPublisher := ""
	mqttUser := ""
	mqttPassword := ""
	mqttTopic := ""
	caseManagementHTTPURL := ""

	if appSettings != nil {
		appName, ok := appSettings["ApplicationName"]
		if ok {
			edgexSdk.LoggingClient.Info(fmt.Sprintf("%s now running...", appName))
		} else {
			edgexSdk.LoggingClient.Error("ApplicationName application setting not found")
			os.Exit(-1)
		}
		tupleTypesFilename, _ = appSettings["TupleTypes"]
		mqttHost, _ = appSettings["MqttHost"]
		mqttPortStr, _ = appSettings["MqttPort"]
		mqttPublisher, _ = appSettings["MqttPublisher"]
		mqttUser, _ = appSettings["MqttUser"]
		mqttPassword, _ = appSettings["MqttPassword"]
		mqttTopic, _ = appSettings["MqttTopic"]
		mqttPort, _ = strconv.Atoi(mqttPortStr)
		caseManagementHTTPURL, _ = appSettings["CaseManagementHTTPURL"]

		edgexSdk.LoggingClient.Info(fmt.Sprintf("Tuple Types File: %s", tupleTypesFilename))
		edgexSdk.LoggingClient.Info(fmt.Sprintf("Mqtt Connection details - host:%s port:%d publisher:%s user:%s topic:%s", mqttHost, mqttPort, mqttPublisher, mqttUser, mqttTopic))

	} else {
		edgexSdk.LoggingClient.Error("No application settings found")
		os.Exit(-1)
	}

	// Add HTTP Route for Rule Engine Dynamic Configuration
	edgexSdk.AddRoute("/flogorules/api/v1/addRule", processAddRule, "POST")
	edgexSdk.AddRoute("/flogorules/api/v1/deleteRule", processDeleteRule, "POST")

	// Initialize LoggingClient for package rules
	rules.LoggingClient = edgexSdk.LoggingClient

	// Create the MQTT Sender
	rules.SetMQTTSender(mqttHost, mqttPort, mqttPublisher, mqttUser, mqttPassword, mqttTopic)

	// Create the HTTP Sender
	rules.SetHTTPSender(caseManagementHTTPURL, "application/json", false)

	// Create Rule Session
	rs, _ = rules.CreateRuleSession(tupleTypesFilename)

	// Start rule session
	rs.Start(nil)

	// 2) Specify device names
	// deviceNames := []string{"Particle-Device"}

	// 3) This is the pipeline configuration, the collection of functions to
	// execute every time an event is triggered.
	edgexSdk.SetFunctionsPipeline(
		// edgexSdk.DeviceNameFilter(deviceNames),
		// edgexSdk.XMLTransform(),
		// edgexSdk.JSONTransform(),
		processEvent,
	)

	// Lastly, we'll go ahead and tell the SDK to "start" and begin listening for events
	// to trigger the pipeline.
	err := edgexSdk.MakeItRun()
	if err != nil {
		edgexSdk.LoggingClient.Error("MakeItRun returned error: ", err.Error())
		os.Exit(-1)
	}

	// Do any required cleanup here

	os.Exit(0)

}

func processEvent(edgexcontext *appcontext.Context, params ...interface{}) (bool, interface{}) {

	if len(params) < 1 {
		// We didn't receive a result
		return false, nil
	}

	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Event: %s", params[0].(models.Event)))

	event := params[0].(models.Event)

	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Processing event for device: %s", event.Device))

	for _, reading := range event.Readings {
		device := event.Device
		eventID := reading.Id
		name := reading.Name
		value := reading.Value

		edgexcontext.LoggingClient.Debug(fmt.Sprintf("Received event from device: %s instrument: %s value: %s", device, name, value))

		rules.GetOrCreateResourceTuple(rs, device, name, value)

		// Assert Reading event
		tcl, _ := model.NewTupleWithKeyValues("ReadingEvent", eventID)
		tcl.SetString(nil, "device", device)
		tcl.SetString(nil, "resource", name)
		tcl.SetString(nil, "value", value)
		rs.Assert(nil, tcl)
	}

	edgexcontext.LoggingClient.Debug(fmt.Sprintf("Payload: %s", event))

	return false, nil
}

func processAddRule(writer http.ResponseWriter, req *http.Request) {
	body, err := ioutil.ReadAll(req.Body)

	if err != nil {
		fmt.Printf("Processing addRule request ERROR\n")
	}

	// fmt.Printf("Processing addRule request: %s\n", body)

	ruleDef := rules.RuleDefStruct{}

	if err := json.Unmarshal([]byte(body), &ruleDef); err != nil {
		fmt.Printf("Processing config request ERROR\n")
	}

	fmt.Printf("Processing addRule - Raw Object in main: %+v\n", ruleDef)

	// Add a rule
	rules.AddRule(rs, ruleDef)

	writer.Header().Set("Content-Type", "text/plain")
	writer.Write([]byte("success config"))
}

func processDeleteRule(writer http.ResponseWriter, req *http.Request) {

	body, err := ioutil.ReadAll(req.Body)

	if err != nil {
		fmt.Printf("Processing deleteRule request ERROR\n")
	}

	ruleDef := rules.RuleDefStruct{}

	if err := json.Unmarshal([]byte(body), &ruleDef); err != nil {
		fmt.Printf("Processing config request ERROR\n")
	}

	fmt.Printf("Processing deleteRule request: %s\n", ruleDef.Name)

	// Delete a rule
	rules.DeleteRule(rs, ruleDef.Name)
}
