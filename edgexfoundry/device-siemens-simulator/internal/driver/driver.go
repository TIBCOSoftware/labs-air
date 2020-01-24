// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2019 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package driver

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	sdkModel "github.com/edgexfoundry/device-sdk-go/pkg/models"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
	"github.com/edgexfoundry/go-mod-core-contracts/models"
)

var cycle00 = []string{
	"Power Available",
	"Ready To Charge",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Next",
}

var cycle01 = []string{
	"Power Available",
	"Ready To Charge",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Timer Delay",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Next",
}

var cycle02 = []string{
	"Power Available",
	"Ready To Charge",
	"Timer Delay",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Energy Report",
	"Fault",
	"Next",
}

var cycle03 = []string{
	"Power Available",
	"Ready To Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Energy Report",
	"Timer Delay",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Reduced Rate Charge",
	"Energy Report",
	"Fault",
	"Next",
}

var cycle04 = []string{
	"Power Available",
	"Ready To Charge",
	"Timer Delay",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Fault",
	"Next",
}

var cycle05 = []string{
	"Power Available",
	"Ready To Charge",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Timer Delay",
	"Fault",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Charging",
	"Energy Report",
	"Next",
}

var voltages = []string{
	"220.0", "221.0", "225.0", "218.0", "220.5", "219.0", "224.0", "218.0", "223.0", "220.0",
}

var currents = []string{
	"30.0", "29.0", "28.0", "30.0", "31.0", "32.0", "27.0", "29.0", "30.0", "31.0",
}

var energy = []string{
	"5.0", "8.0", "10.0", "2.0", "3.0", "4.0", "5.0", "7.0", "6.0", "5.0",
}

var currentCycle = cycle00
var currentIndex = 0
var reportEnergy = false

var once sync.Once
var driver *Driver

// Driver the driver sructure
type Driver struct {
	Logger           logger.LoggingClient
	AsyncCh          chan<- *sdkModel.AsyncValues
	CommandResponses sync.Map
}

// NewProtocolDriver creates a new driver
func NewProtocolDriver() sdkModel.ProtocolDriver {
	once.Do(func() {
		driver = new(Driver)
	})
	return driver
}

// DisconnectDevice disconnect
func (d *Driver) DisconnectDevice(deviceName string, protocols map[string]models.ProtocolProperties) error {
	d.Logger.Warn("Driver's DisconnectDevice function didn't implement")
	return nil
}

// Initialize the device
func (d *Driver) Initialize(lc logger.LoggingClient, asyncCh chan<- *sdkModel.AsyncValues) error {
	d.Logger = lc
	d.AsyncCh = asyncCh
	return nil
}

// HandleReadCommands executes a oommand
// Note:  This simulator assumes there is always only one request (Status). However,
// with each status, there are other resource values that are also published
func (d *Driver) HandleReadCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModel.CommandRequest) ([]*sdkModel.CommandValue, error) {
	d.Logger.Debug(fmt.Sprintf("Device %s is handling read command", deviceName))
	var responses = make([]*sdkModel.CommandValue, len(reqs))
	var resTime = time.Now().UnixNano() / int64(time.Millisecond)
	var cv *sdkModel.CommandValue
	val := ""
	for i, req := range reqs {
		d.Logger.Debug(fmt.Sprintf("Request for resource: %s", req.DeviceResourceName))

		if req.DeviceResourceName == "Status" {
			// val := "Power Available"
			val = getReading(deviceName)

			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))

			cv = sdkModel.NewStringValue(req.DeviceResourceName, resTime, val)

			responses[i] = cv
		} else if req.DeviceResourceName == "Voltage" {
			val = voltages[rand.Intn(10)]
			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))
			cv = sdkModel.NewStringValue("Voltage", resTime, val)
			responses[i] = cv
		} else if req.DeviceResourceName == "Current" {
			val = currents[rand.Intn(10)]
			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))
			cv = sdkModel.NewStringValue("Current", resTime, val)
			responses[i] = cv
		} else if req.DeviceResourceName == "Energy" {
			if reportEnergy {
				val = energy[rand.Intn(10)]
				reportEnergy = false
			} else {
				val = "0"
			}

			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))
			cv = sdkModel.NewStringValue("Energy", resTime, val)
			responses[i] = cv
		}

	}

	d.Logger.Debug(fmt.Sprintf("Device %s is sending response", deviceName))
	return responses, nil
}

func getReading(deviceName string) string {
	reading := ""
	if deviceName == "versicharge-0001" {
		reading = currentCycle[currentIndex]

		currentIndex++

		if currentCycle[currentIndex] == "Energy Report" {
			currentIndex++
			reportEnergy = true
		}

		if currentCycle[currentIndex] == "Next" {
			currentIndex = 0
			nextCycle := rand.Intn(5)

			if nextCycle == 0 {
				currentCycle = cycle00
			} else if nextCycle == 1 {
				currentCycle = cycle01
			} else if nextCycle == 2 {
				currentCycle = cycle02
			} else if nextCycle == 3 {
				currentCycle = cycle03
			} else if nextCycle == 4 {
				currentCycle = cycle04
			} else {
				currentCycle = cycle05
			}
		}
	}

	return reading
}

// HandleWriteCommands write command
func (d *Driver) HandleWriteCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModel.CommandRequest, params []*sdkModel.CommandValue) error {
	var err error

	return err
}

// Stop the protocol-specific DS code to shutdown gracefully, or
// if the force parameter is 'true', immediately. The driver is responsible
// for closing any in-use channels, including the channel used to send async
// readings (if supported).
func (d *Driver) Stop(force bool) error {
	// Then Logging Client might not be initialized
	if d.Logger != nil {
		d.Logger.Debug(fmt.Sprintf("Driver.Stop called: force=%v", force))
	}
	return nil
}

// AddDevice is a callback function that is invoked
// when a new Device associated with this Device Service is added
func (d *Driver) AddDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error {
	d.Logger.Debug(fmt.Sprintf("a new Device is added: %s", deviceName))
	return nil
}

// UpdateDevice is a callback function that is invoked
// when a Device associated with this Device Service is updated
func (d *Driver) UpdateDevice(deviceName string, protocols map[string]models.ProtocolProperties, adminState models.AdminState) error {
	d.Logger.Debug(fmt.Sprintf("Device %s is updated", deviceName))
	return nil
}

// RemoveDevice is a callback function that is invoked
// when a Device associated with this Device Service is removed
func (d *Driver) RemoveDevice(deviceName string, protocols map[string]models.ProtocolProperties) error {
	d.Logger.Debug(fmt.Sprintf("Device %s is removed", deviceName))
	return nil
}
