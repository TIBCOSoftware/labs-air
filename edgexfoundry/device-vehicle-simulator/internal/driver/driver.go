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

var maxIndex = 12
var readings01 = []string{
	"25.771088|-80.163483|Miami, FL - Port of Miami Terminal Operating Company",
	"27.439775|-80.32299|Fort Pierce, FL",
	"28.349469|-80.731105|Cocoa, FL",
	"30.401564|-81.571033|Jacksonville, FL - JaxPort ICTF",
	"32.116716|-81.144147|Savannah, GA - Garden City Terminal",
	"32.866511|-79.995399|Charleston, SC",
	"34.191224|-77.952419|Wilmington, NC - Container Terminal",
	"36.850172|-76.319269|Portsmouth, VA",
	"36.915037|-76.320643|Norfolk, VA - Norfolk International Terminals",
	"39.262025|-76.549294|Baltimore, MD - Seagirt Marine Terminal",
	"39.900933|-75.143453|Philadelphia, PA - Greenwhich",
	"40.690263|-74.152375|Port Newark Container Terminal, NJ",
	"42.259951|-71.789244|Worcester, MA",
}
var readings02 = []string{
	"47.492471|-122.26888|Seattle, WA - South Seattle",
	"45.552207|-122.722648|Portland, OR - Terminal 2 (Guilds Lake)",
	"39.53246|-119.751524|Sparks, NV",
	"37.899332|-121.169307|Stockton, CA",
	"37.803528|-122.312138|Oakland, CA - Oakland International Gateway",
	"36.273183|-115.070534|Las Vegas, NV",
	"34.106012|-117.320254|San Bernardino, CA",
	"33.77032|-118.273289|Wilmington, CA - TraPac Intermodal Container Transfer Facility",
	"33.515564|-112.160564|Phoenix, AZ - Glendale",
	"32.126437|-110.848336|Tucson, AZ",
	"31.752085|-106.488887|El Paso, TX",
	"35.04758|-106.653344|Albuquerque, NM",
	"39.796963|-104.995374|Denver, CO - Irondale",
}
var readings03 = []string{
	"29.302729|-98.638744|San Antonio, TX - SAIT",
	"29.638421|-95.292245|Houston, TX - Pearland",
	"32.615525|-96.693485|Dallas, TX - Wilmer (Dallas Intermodal Terminal)",
	"29.917836|-90.205272|New Orleans, LA",
	"32.256403|-90.151546|Jackson, MS",
	"35.044849|-90.153006|Memphis, TN",
	"38.524627|-90.209535|St. Louis, MO - Dupo",
	"39.870851|-88.912284|Decatur, IL - ADM Intermodal Ramp",
	"41.705694|-87.577341|Chicago, IL - Calumet",
	"41.902382|-89.101932|Chicago, IL - Rochelle (Global III)",
	"44.251243|-91.509663|Arcadia, WI",
	"44.970069|-93.174527|St. Paul, MN - Midway",
	"46.758181|-92.098748|Duluth, MN - Clure Public Marine Terminal",
}

var speeds = []string{
	"0.0", "15.0", "38.0", "45.0", "50.0", "52.0", "55.0", "60.0", "65.0", "66.0",
}

var readings01Index = 0
var readings01Direction = "lr"
var readings02Index = 0
var readings02Direction = "lr"
var readings03Index = 0
var readings03Direction = "lr"

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
func (d *Driver) HandleReadCommands(deviceName string, protocols map[string]models.ProtocolProperties, reqs []sdkModel.CommandRequest) ([]*sdkModel.CommandValue, error) {
	d.Logger.Info(fmt.Sprintf("Device %s is handling read command", deviceName))
	var responses = make([]*sdkModel.CommandValue, len(reqs))
	var resTime = time.Now().UnixNano() / int64(time.Millisecond)

	for i, req := range reqs {
		d.Logger.Info(fmt.Sprintf("Request for resource: %s", req.DeviceResourceName))

		if req.DeviceResourceName == "GPS" {
			// val := "39.073891, -76.88633"
			val := getReading(deviceName)

			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))
			var cv *sdkModel.CommandValue

			cv = sdkModel.NewStringValue(req.DeviceResourceName, resTime, val)

			responses[i] = cv
		} else if req.DeviceResourceName == "Speedometer" {
			// val := "39.0"
			val := speeds[rand.Intn(10)]

			d.Logger.Info(fmt.Sprintf("Device %s is sending: %s", deviceName, val))
			var cv *sdkModel.CommandValue

			cv = sdkModel.NewStringValue(req.DeviceResourceName, resTime, val)

			responses[i] = cv
		}

	}

	d.Logger.Info(fmt.Sprintf("Device %s is sending response", deviceName))
	return responses, nil
}

func getReading(deviceName string) string {
	reading := "0.0, 0.0"
	if deviceName == "train-0001" {
		reading = readings01[readings01Index]

		if readings01Index == maxIndex {
			readings01Index--
			readings01Direction = "rl"

		} else if readings01Index == 0 {
			readings01Index++
			readings01Direction = "lr"
		} else if readings01Direction == "rl" {
			readings01Index--
		} else {
			readings01Index++
		}

	} else if deviceName == "train-0002" {
		reading = readings02[readings02Index]

		if readings02Index == maxIndex {
			readings02Index--
			readings02Direction = "rl"

		} else if readings02Index == 0 {
			readings02Index++
			readings02Direction = "lr"
		} else if readings02Direction == "rl" {
			readings02Index--
		} else {
			readings02Index++
		}

	} else if deviceName == "train-0003" {
		reading = readings03[readings03Index]

		if readings03Index == maxIndex {
			readings03Index--
			readings03Direction = "rl"

		} else if readings03Index == 0 {
			readings03Index++
			readings03Direction = "lr"
		} else if readings03Direction == "rl" {
			readings03Index--
		} else {
			readings03Index++
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
