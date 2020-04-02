// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package main

import (
	device_particle_mqtt "github.com/TIBCOSoftware/labs-air/edgexfoundry/device-stm32l475-mqtt"
	"github.com/TIBCOSoftware/labs-air/edgexfoundry/device-stm32l475-mqtt/internal/driver"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
)

const (
	serviceName string = "device-stm32l475-mqtt"
)

func main() {
	sd := driver.NewProtocolDriver()
	startup.Bootstrap(serviceName, device_particle_mqtt.Version, sd)
}
