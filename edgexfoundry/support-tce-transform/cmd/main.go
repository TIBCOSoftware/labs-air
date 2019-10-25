package main

import (
	"fmt"
	"os"

	// "github.com/edgexfoundry/app-functions-sdk-go/pkg/transforms"
	"github.com/TIBCOSoftware/labs-air/edgexfoundry/support-tce-transfrom/internal/transforms"

	"github.com/edgexfoundry/app-functions-sdk-go/appcontext"
	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/go-mod-core-contracts/models"
)

const (
	serviceKey = "support-tce-transform"
)

var httpSender transforms.HTTPSender

func main() {

	// First thing to do is to create an instance of the EdgeX SDK and initialize it.
	edgexSdk := &appsdk.AppFunctionsSDK{ServiceKey: serviceKey}
	if err := edgexSdk.Initialize(); err != nil {
		edgexSdk.LoggingClient.Error(fmt.Sprintf("SDK initialization failed: %v\n", err))
		os.Exit(-1)
	}

	// Get the application's specific configuration settings.
	appSettings := edgexSdk.ApplicationSettings()
	tceEndpoint := ""

	if appSettings != nil {
		appName, ok := appSettings["ApplicationName"]
		if ok {
			edgexSdk.LoggingClient.Info(fmt.Sprintf("%s now running...", appName))
		} else {
			edgexSdk.LoggingClient.Error("ApplicationName application setting not found")
			os.Exit(-1)
		}
		tceEndpoint, _ = appSettings["TCEEndpoint"]

		edgexSdk.LoggingClient.Info(fmt.Sprintf("TCE Endpoint: %s", tceEndpoint))

	} else {
		edgexSdk.LoggingClient.Error("No application settings found")
		os.Exit(-1)
	}

	// Create the HTTP Sender
	httpSender = transforms.NewHTTPSender(tceEndpoint, "application/json")

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

	edgexcontext.LoggingClient.Info(fmt.Sprintf("Event: %s", params[0].(models.Event)))

	if len(params) < 1 {
		// We didn't receive a result
		return false, nil
	}

	event := params[0].(models.Event)

	// edgexcontext.LoggingClient.Debug(fmt.Sprintf("Processing event for device: %s", event.Device))

	for _, reading := range event.Readings {
		device := event.Device
		// eventID := reading.Id
		name := reading.Name
		value := reading.Value

		edgexcontext.LoggingClient.Debug(fmt.Sprintf("Received event from device: %s instrument: %s value: %s", device, name, value))

	}

	httpSender.HTTPPost(edgexcontext, params)

	edgexcontext.LoggingClient.Debug(fmt.Sprintf("Payload: %s", event))

	return false, nil
}
