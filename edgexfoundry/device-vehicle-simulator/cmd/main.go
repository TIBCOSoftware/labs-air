// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package main

import (
	device_vehicle_simulator "github.com/TIBCOSoftware/labs-air/edgexfoundry/device-vehicle-simulator"
	"github.com/TIBCOSoftware/labs-air/edgexfoundry/device-vehicle-simulator/internal/driver"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
)

const (
	serviceName string = "edgex-vehicle-simulator"
)

func main() {
	sd := driver.NewProtocolDriver()
	startup.Bootstrap(serviceName, device_vehicle_simulator.Version, sd)
}
