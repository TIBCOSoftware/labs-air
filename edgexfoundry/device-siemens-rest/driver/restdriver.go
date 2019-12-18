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
	"fmt"
	"time"

	dsModels "github.com/edgexfoundry/device-sdk-go/pkg/models"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
	contract "github.com/edgexfoundry/go-mod-core-contracts/models"
)

type RestDriver struct {
	restHandler *RestHandler
	logger      logger.LoggingClient
	asyncValues chan<- *dsModels.AsyncValues
}

// Initialize performs protocol-specific initialization for the device
// service.
func (driver *RestDriver) Initialize(logger logger.LoggingClient, asyncValues chan<- *dsModels.AsyncValues) error {
	driver.logger = logger
	handler := NewRestHandler(logger, asyncValues)
	driver.restHandler = handler
	return handler.Start()
}

// HandleReadCommands triggers a protocol Read operation for the specified device.
func (driver *RestDriver) HandleReadCommands(deviceName string, protocols map[string]contract.ProtocolProperties, reqs []dsModels.CommandRequest) ([]*dsModels.CommandValue, error) {
	driver.logger.Debug(fmt.Sprintf("RestDriver.HandleReadCommands called"))

	var responses = make([]*dsModels.CommandValue, len(reqs))
	var err error
	var timestamp = time.Now().UnixNano() / int64(time.Millisecond)
	var res *dsModels.CommandValue
	reading := ""

	for i, req := range reqs {

		if req.DeviceResourceName == "Status" {
			if req.Type == dsModels.Float32 {
				reading = fmt.Sprintf("%f", driver.restHandler.lastMsg.Status)
			} else if req.Type == dsModels.Int16 {
				reading = fmt.Sprintf("%d", driver.restHandler.lastMsg.Status)
			} else if req.Type == dsModels.Bool {
				reading = fmt.Sprintf("%t", driver.restHandler.lastMsg.Status)
			} else {
				reading = driver.restHandler.lastMsg.Status
			}
		} else if req.DeviceResourceName == "Voltage" {
			if req.Type == dsModels.Float32 {
				reading = fmt.Sprintf("%f", driver.restHandler.lastMsg.Voltage)
			} else if req.Type == dsModels.Int16 {
				reading = fmt.Sprintf("%d", driver.restHandler.lastMsg.Voltage)
			} else if req.Type == dsModels.Bool {
				reading = fmt.Sprintf("%t", driver.restHandler.lastMsg.Voltage)
			}
		} else if req.DeviceResourceName == "Current" {
			if req.Type == dsModels.Float32 {
				reading = fmt.Sprintf("%f", driver.restHandler.lastMsg.Current)
			} else if req.Type == dsModels.Int16 {
				reading = fmt.Sprintf("%d", driver.restHandler.lastMsg.Current)
			} else if req.Type == dsModels.Bool {
				reading = fmt.Sprintf("%t", driver.restHandler.lastMsg.Current)
			}
		} else if req.DeviceResourceName == "Delay" {
			if req.Type == dsModels.Float32 {
				reading = fmt.Sprintf("%f", driver.restHandler.lastMsg.Delay)
			} else if req.Type == dsModels.Int16 {
				reading = fmt.Sprintf("%d", driver.restHandler.lastMsg.Delay)
			} else if req.Type == dsModels.Bool {
				reading = fmt.Sprintf("%t", driver.restHandler.lastMsg.Delay)
			}
		}

		res, err = dsModels.NewCommandValue(req.DeviceResourceName, timestamp, reading, dsModels.String)

		if err != nil {
			driver.logger.Info(fmt.Sprintf("Handle read commands failed: %v", err))
			return responses, err
		}

		responses[i] = res
	}

	return responses, err
}

// HandleWriteCommands passes a slice of CommandRequest struct each representing
// a ResourceOperation for a specific device resource.
// Since the commands are actuation commands, params provide parameters for the individual
// command.
func (driver *RestDriver) HandleWriteCommands(deviceName string, protocols map[string]contract.ProtocolProperties, reqs []dsModels.CommandRequest,
	params []*dsModels.CommandValue) error {

	return fmt.Errorf("RestDriver.HandleWriteCommands; write commands not supported")
}

// Stop the protocol-specific DS code to shutdown gracefully, or
// if the force parameter is 'true', immediately. The driver is responsible
// for closing any in-use channels, including the channel used to send async
// readings (if supported).
func (driver *RestDriver) Stop(force bool) error {
	driver.logger.Debug(fmt.Sprintf("RestDriver.Stop called: force=%v", force))
	// Nothing required to do for Stop
	return nil
}

// AddDevice is a callback function that is invoked
// when a new Device associated with this Device Service is added
func (driver *RestDriver) AddDevice(deviceName string, protocols map[string]contract.ProtocolProperties, adminState contract.AdminState) error {
	// Nothing required to do for AddDevice since new devices will be available
	// when data is posted to REST endpoint
	return nil
}

// UpdateDevice is a callback function that is invoked
// when a Device associated with this Device Service is updated
func (driver *RestDriver) UpdateDevice(deviceName string, protocols map[string]contract.ProtocolProperties, adminState contract.AdminState) error {
	// Nothing required to do for UpdateDevice since device update will be available
	// when data is posted to REST endpoint.
	return nil
}

// RemoveDevice is a callback function that is invoked
// when a Device associated with this Device Service is removed
func (driver *RestDriver) RemoveDevice(deviceName string, protocols map[string]contract.ProtocolProperties) error {
	// Nothing required to do for RemoveDevice since removed device will no longer be available
	// when data is posted to REST endpoint.
	return nil
}
