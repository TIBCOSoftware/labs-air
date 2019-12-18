//
// Copyright (c) 2019 Intel Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

package driver

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	sdk "github.com/edgexfoundry/device-sdk-go"
	"github.com/edgexfoundry/device-sdk-go/pkg/models"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"

	"github.com/gorilla/mux"
	"github.com/spf13/cast"
)

const (
	deviceNameKey      = "deviceName"
	opNameKey          = "opName"
	apiDevicePostRoute = "/{" + deviceNameKey + "}"
	apiDeviceGetRoute  = "/{" + deviceNameKey + "}/{" + opNameKey + "}"
	handlerContextKey  = "RestHandler"
)

type incomingMsgType struct {
	Status  string
	Voltage float32
	Current float32
	Delay   int16
}

type RestHandler struct {
	lastMsg     *incomingMsgType
	router      *mux.Router
	logger      logger.LoggingClient
	configMap   map[string]string
	asyncValues chan<- *models.AsyncValues
}

func NewRestHandler(logger logger.LoggingClient, asyncValues chan<- *models.AsyncValues) *RestHandler {
	lastMsg := incomingMsgType{
		Status:  "Power Available",
		Voltage: 220.0,
		Current: 30.0,
		Delay:   0,
	}

	handler := RestHandler{
		logger:      logger,
		asyncValues: asyncValues,
		router:      mux.NewRouter(),
		configMap:   sdk.DriverConfigs(),
		lastMsg:     &lastMsg,
	}

	return &handler
}

func (handler RestHandler) Start() error {
	service := sdk.RunningService()

	if err := service.AddRoute(apiDevicePostRoute, handler.addContext(devicePostHandler), http.MethodPost); err != nil {
		return fmt.Errorf("unable to add required route: %s: %s", apiDevicePostRoute, err.Error())
	}
	handler.logger.Info(fmt.Sprintf("Route %s added.", apiDevicePostRoute))

	if err := service.AddRoute(apiDeviceGetRoute, handler.addContext(deviceGetHandler), http.MethodGet); err != nil {
		return fmt.Errorf("New unable to add required route: %s: %s", apiDeviceGetRoute, err.Error())
	}

	handler.logger.Info(fmt.Sprintf("Route %s added.", apiDeviceGetRoute))

	return nil
}

func (handler RestHandler) addContext(next func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), handlerContextKey, handler)
		next(w, r.WithContext(ctx))
	})
}

func (handler RestHandler) processAsyncRequest(writer http.ResponseWriter, request *http.Request) {
	vars := mux.Vars(request)
	deviceName := vars[deviceNameKey]

	handler.logger.Debug(fmt.Sprintf("Received POST for Device=%s", deviceName))

	service := sdk.RunningService()

	// devices := service.Devices();

	// handler.logger.Debug("Received POST for Device=%s Resource:m", devices)

	_, err := service.GetDeviceByName(deviceName)
	if err != nil {
		handler.logger.Error(fmt.Sprintf("Incoming reading ignored. Device '%s' not found", deviceName))
		http.Error(writer, fmt.Sprintf("Device '%s' not found", deviceName), http.StatusNotFound)
		return
	}

	reading, err := handler.readBodyAsString(writer, request)
	if err != nil {
		handler.logger.Error(fmt.Sprintf("Incoming reading ignored. Unable to read request body: %s", err.Error()))
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var timestamp = time.Now().UnixNano() / int64(time.Millisecond)
	inMsg := incomingMsgType{}
	json.Unmarshal([]byte(reading), &inMsg)

	// Update last values received
	handler.lastMsg.Status = inMsg.Status
	handler.lastMsg.Voltage = inMsg.Voltage
	handler.lastMsg.Current = inMsg.Current
	handler.lastMsg.Delay = inMsg.Delay

	resourceNames := []string{"Status", "Voltage", "Current", "Delay"}

	for i, rn := range resourceNames {

		deviceResource, ok := service.DeviceResource(deviceName, resourceNames[i], "get")
		if !ok {
			handler.logger.Error(fmt.Sprintf("Incoming reading ignored. Resource '%s' not found", rn))
			http.Error(writer, fmt.Sprintf("Resource '%s' not found", rn), http.StatusNotFound)
			return
		}

		valueType := ""
		if deviceResource.Properties.Value.Type == "Float32" {
			valueType = "String"
		} else {
			valueType = deviceResource.Properties.Value.Type
		}

		commandRequest := models.CommandRequest{
			DeviceResourceName: rn,
			Type:               models.ParseValueType(valueType),
		}

		value := &models.CommandValue{}
		if rn == "Status" {
			value, err = handler.newCommandValue(commandRequest, inMsg.Status, timestamp)
		} else if rn == "Voltage" {
			value, err = handler.newCommandValue(commandRequest, inMsg.Voltage, timestamp)
		} else if rn == "Current" {
			value, err = handler.newCommandValue(commandRequest, inMsg.Current, timestamp)
		} else if rn == "Delay" {
			value, err = handler.newCommandValue(commandRequest, inMsg.Delay, timestamp)
		}

		// value, err := handler.newCommandValue(commandRequest, reading)
		if err != nil {
			handler.logger.Error(fmt.Sprintf("Incoming reading ignored. Unable to create Command Value for Device=%s Command=%s: %s", deviceName, rn, err.Error()))
			http.Error(writer, err.Error(), http.StatusBadRequest)
			return
		}
		asyncValues := &models.AsyncValues{
			DeviceName:    deviceName,
			CommandValues: []*models.CommandValue{value},
		}

		handler.logger.Debug(fmt.Sprintf("Incoming reading received: Device=%s Resource=%s", deviceName, value))

		handler.asyncValues <- asyncValues

	}

}

func (handler RestHandler) processGetRequest(writer http.ResponseWriter, request *http.Request) {
	vars := mux.Vars(request)
	deviceName := vars[deviceNameKey]
	opName := vars[opNameKey]

	handler.logger.Debug(fmt.Sprintf("Received GET for Device=%s  OpName=%s", deviceName, opName))

	response := "{Invalid Operation}"
	if opName == "check_alert" {
		response = `{"Alert":0,"Status":"active"}`
	} else if opName == "check_test" {
		response = `{"Test":true}`
	}

	writer.Write([]byte(response))
}

func (handler RestHandler) readBodyAsString(writer http.ResponseWriter, request *http.Request) (string, error) {
	defer request.Body.Close()
	body, err := ioutil.ReadAll(request.Body)
	if err != nil {
		return "", err
	}

	if len(body) == 0 {
		return "", fmt.Errorf("no request body provided")
	}

	return string(body), nil
}

func (handler RestHandler) newCommandValue(request models.CommandRequest, reading interface{}, timestamp int64) (*models.CommandValue, error) {
	var result = &models.CommandValue{}
	var err error
	castError := "fail to parse %v reading, %v"

	// if !checkValueInRange(request.Type, reading) {
	// 	err = fmt.Errorf("parse reading fail. Reading %v is out of the value type(%v)'s range", reading, request.Type)
	// 	handler.logger.Error(err.Error())
	// 	return result, err
	// }

	switch request.Type {
	case models.Bool:
		val, err := cast.ToBoolE(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewBoolValue(request.DeviceResourceName, timestamp, val)
	case models.String:
		val, err := cast.ToStringE(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result = models.NewStringValue(request.DeviceResourceName, timestamp, val)
	case models.Uint8:
		val, err := cast.ToUint8E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewUint8Value(request.DeviceResourceName, timestamp, val)
	case models.Uint16:
		val, err := cast.ToUint16E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewUint16Value(request.DeviceResourceName, timestamp, val)
	case models.Uint32:
		val, err := cast.ToUint32E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewUint32Value(request.DeviceResourceName, timestamp, val)
	case models.Uint64:
		val, err := cast.ToUint64E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewUint64Value(request.DeviceResourceName, timestamp, val)
	case models.Int8:
		val, err := cast.ToInt8E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewInt8Value(request.DeviceResourceName, timestamp, val)
	case models.Int16:
		val, err := cast.ToInt16E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewInt16Value(request.DeviceResourceName, timestamp, val)
	case models.Int32:
		val, err := cast.ToInt32E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewInt32Value(request.DeviceResourceName, timestamp, val)
	case models.Int64:
		val, err := cast.ToInt64E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewInt64Value(request.DeviceResourceName, timestamp, val)
	case models.Float32:
		val, err := cast.ToFloat32E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewFloat32Value(request.DeviceResourceName, timestamp, val)
	case models.Float64:
		val, err := cast.ToFloat64E(reading)
		if err != nil {
			return nil, fmt.Errorf(castError, request.DeviceResourceName, err)
		}
		result, err = models.NewFloat64Value(request.DeviceResourceName, timestamp, val)
	default:
		err = fmt.Errorf("return result fail, none supported value type: %v", request.Type)
	}

	return result, err
}

func devicePostHandler(writer http.ResponseWriter, request *http.Request) {
	handler, ok := request.Context().Value(handlerContextKey).(RestHandler)
	handler.logger.Info(fmt.Sprintf("Inside Device Post Handler"))
	if !ok {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("Bad context pass to handler"))
		return
	}

	handler.processAsyncRequest(writer, request)
}

func deviceGetHandler(writer http.ResponseWriter, request *http.Request) {
	handler, ok := request.Context().Value(handlerContextKey).(RestHandler)

	if !ok {
		writer.WriteHeader(http.StatusBadRequest)
		writer.Write([]byte("Bad context pass to handler"))
		return
	}

	handler.logger.Info(fmt.Sprintf("Inside Device Get Handler"))

	handler.processGetRequest(writer, request)
}
