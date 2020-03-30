package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	inttransforms "github.com/TIBCOSoftware/labs-air/edgexfoundry/app-service-export-mqtt/internal/transforms"
	"github.com/edgexfoundry/app-functions-sdk-go/appcontext"
	"github.com/edgexfoundry/app-functions-sdk-go/appsdk"
	"github.com/edgexfoundry/go-mod-core-contracts/models"
)

const (
	serviceKey = "app-service-export-mqtt"
)

type msgStruct struct {
	ID       string           `json:"id"`
	Device   string           `json:"device"`
	Origin   int64            `json:"source"`
	Gateway  string           `json:"gateway"`
	Readings []models.Reading `json:"readings"`
}

var mqttSender *inttransforms.MQTTSender
var gatewayID string

func main() {

	// Create an instance of the EdgeX SDK and initialize it.
	edgexSdk := &appsdk.AppFunctionsSDK{ServiceKey: serviceKey}
	if err := edgexSdk.Initialize(); err != nil {
		message := fmt.Sprintf("SDK initialization failed: %v\n", err)
		if edgexSdk.LoggingClient != nil {
			edgexSdk.LoggingClient.Error(message)
		} else {
			fmt.Println(message)
		}
		os.Exit(-1)
	}

	// Get the application's specific configuration settings.
	// deviceNames := getAppSetting(edgexSdk, "DeviceNames")
	gatewayID = getAppSetting(edgexSdk, "GatewayId")[0]

	// Create the MQTT Sender
	mqttConfig, _ := inttransforms.LoadMQTTConfig(edgexSdk)
	mqttSender = inttransforms.NewMQTTSender(edgexSdk.LoggingClient, nil, mqttConfig)

	// Set pipeline configuration, the collection of functions to
	// execute every time an event is triggered.
	edgexSdk.SetFunctionsPipeline(
		// transforms.NewFilter(deviceNames).FilterByDeviceName,
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

func getAppSetting(edgexSdk *appsdk.AppFunctionsSDK, settingName string) []string {

	setting, err := edgexSdk.GetAppSettingStrings(settingName)

	if err != nil {
		edgexSdk.LoggingClient.Error(err.Error())
		os.Exit(-1)
	}

	edgexSdk.LoggingClient.Info(fmt.Sprintf("%s: %v", settingName, setting))

	return setting

}

func processEvent(edgexcontext *appcontext.Context, params ...interface{}) (bool, interface{}) {

	if len(params) < 1 {
		// We didn't receive a result
		return false, nil
	}

	edgexcontext.LoggingClient.Debug(fmt.Sprintf("Event: %s", params[0].(models.Event)))

	if event, ok := params[0].(models.Event); ok {

		edgexcontext.LoggingClient.Debug(fmt.Sprintf("Processing event for device: %s", event.Device))

		jsondat := &msgStruct{
			ID:       event.ID,
			Device:   event.Device,
			Origin:   event.Origin,
			Gateway:  gatewayID,
			Readings: event.Readings,
		}

		encjson, _ := json.Marshal(jsondat)

		edgexcontext.LoggingClient.Info(fmt.Sprintf("New Event: %s", encjson))

		// Export event
		return mqttSender.MQTTSend(string(encjson))

		// return false, nil
	}

	return false, errors.New("Unexpected type received")

}
