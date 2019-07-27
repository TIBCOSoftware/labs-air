package main

import (
	"fmt"
	"os"

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
	ruleDefsFilename := ""
	tupleTypesFilename := ""
	if appSettings != nil {
		appName, ok := appSettings["ApplicationName"]
		if ok {
			edgexSdk.LoggingClient.Info(fmt.Sprintf("%s now running...", appName))
		} else {
			edgexSdk.LoggingClient.Error("ApplicationName application setting not found")
			os.Exit(-1)
		}
		ruleDefsFilename, _ = appSettings["RulesDefinitions"]
		tupleTypesFilename, _ = appSettings["TupleTypes"]

		edgexSdk.LoggingClient.Info(fmt.Sprintf("Rule Definitions File: %s", ruleDefsFilename))
		edgexSdk.LoggingClient.Info(fmt.Sprintf("Tuple Types File: %s", tupleTypesFilename))

	} else {
		edgexSdk.LoggingClient.Error("No application settings found")
		os.Exit(-1)
	}

	// Initialize LoggingClient for package rules
	rules.LoggingClient = edgexSdk.LoggingClient

	// Create Rule Session
	// rs, _ = rules.CreateRuleSession(tupleTypesFilename)
	rs, _ = rules.CreateAndLoadRuleSession(tupleTypesFilename, ruleDefsFilename)

	// Create Rules
	// rules.CreateRules(rs, ruleDefsFilename, edgexSdk.LoggingClient)

	// Start rule session
	rs.Start(nil)

	// Initialize Led tuple
	rules.GetOrCreateTuple(rs, "mesh-argon-10", "Led", "false")

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

func printXMLToConsole(edgexcontext *appcontext.Context, params ...interface{}) (bool, interface{}) {
	// edgexcontext.LoggingClient.Info(fmt.Sprintf("%s in printing...", params[0].(string)))

	if len(params) < 1 {
		// We didn't receive a result
		return false, nil
	}

	// fmt.Println(params[0].(string))
	fmt.Println(params[0].(models.Event))

	// Leverage the built in logging service in EdgeX
	edgexcontext.LoggingClient.Debug("XML printed to console")

	// edgexcontext.Complete([]byte(params[0].(string)))

	return false, nil
}

func processEvent(edgexcontext *appcontext.Context, params ...interface{}) (bool, interface{}) {

	if len(params) < 1 {
		// We didn't receive a result
		return false, nil
	}

	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Event: %s", params[0].(models.Event)))
	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Event: %s", params[0].(string)))

	event := params[0].(models.Event)

	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Top Level: %s", event.Device))

	for _, reading := range event.Readings {
		device := event.Device
		eventID := reading.Id
		name := reading.Name
		value := reading.Value

		rules.GetOrCreateTuple(rs, device, name, value)

		// Assert Reading event
		tcl, _ := model.NewTupleWithKeyValues("Reading", eventID)
		tcl.SetString(nil, "device", device)
		tcl.SetString(nil, "instrument", name)
		tcl.SetString(nil, "value", value)
		rs.Assert(nil, tcl)

		// Since this is a example, we will just print put some stats from the images received
		fmt.Printf("Received Event from Device: %s, ReadingName: %s\n",
			reading.Device, reading.Name)
	}

	// payload, _ := json.Marshal(event)

	// device := params[0].(models.Event).device

	edgexcontext.LoggingClient.Debug(fmt.Sprintf("Payload: %s", event))

	return false, nil
}
