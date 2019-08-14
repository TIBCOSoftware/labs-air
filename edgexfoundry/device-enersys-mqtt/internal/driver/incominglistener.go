// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018-2019 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

package driver

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	sdk "github.com/edgexfoundry/device-sdk-go"
	sdkModel "github.com/edgexfoundry/device-sdk-go/pkg/models"
)

// EnersysData Structure for enersys data
type EnersysData struct {
	Data string
}

// EnersysPayload Structure for enersys payload
type EnersysPayload struct {
	DeviceID          string
	Timeseriespayload []EnersysData
}

var metrics = []string{"BatteryStateCharge", "BatteryStateHealth", "TotalEnergyCharged", "TotalEnergyDischarged", "EnergyCharged", "EnergyDischarged", "MaxumunModSensorTemperature", "MinumunModSensorTemperature", "MaximumCellVoltage", "MinimumCellVoltage", "CurrentBatteryPower", "TotalBatterySystemAmperage", "TotalBatteryPackVoltage", "AmbientTemperature",
	"CellVoltage1", "CellVoltage2", "CellVoltage3", "CellVoltage4", "CellVoltage5", "CellVoltage6", "CellVoltage7", "CellVoltage8", "CellVoltage9", "CellVoltage10",
	"CellVoltage11", "CellVoltage12", "CellVoltage13", "CellVoltage14", "CellVoltage15", "CellVoltage16", "CellVoltage17", "CellVoltage18", "CellVoltage19", "CellVoltage20", "CellVoltage21", "CellVoltage22", "CellVoltage23", "CellVoltage24", "CellVoltage25", "CellVoltage26", "CellVoltage27", "CellVoltage28", "CellVoltage29", "CellVoltage30",
	"CellVoltage31", "CellVoltage32", "CellVoltage33", "CellVoltage34", "CellVoltage35", "CellVoltage36", "CellVoltage37", "CellVoltage38", "CellVoltage39", "CellVoltage40", "CellVoltage41", "CellVoltage42", "CellVoltage43", "CellVoltage44", "CellVoltage45", "CellVoltage46", "CellVoltage47", "CellVoltage48", "CellVoltage49", "CellVoltage50",
	"CellVoltage51", "CellVoltage52", "CellVoltage53", "CellVoltage54", "CellVoltage55", "CellVoltage56", "CellVoltage57", "CellVoltage58", "CellVoltage59", "CellVoltage60", "CellVoltage61", "CellVoltage62", "CellVoltage63", "CellVoltage64", "CellVoltage65", "CellVoltage66", "CellVoltage67", "CellVoltage68", "CellVoltage69", "CellVoltage70",
	"CellTemperature1", "CellTemperature2", "CellTemperature3", "CellTemperature4", "CellTemperature5", "CellTemperature6", "CellTemperature7", "CellTemperature8", "CellTemperature9", "CellTemperature10",
	"BoardTemperature1", "BoardTemperature2", "BoardTemperature3", "BoardTemperature4", "BoardTemperature5", "BoardTemperature6", "BoardTemperature7", "BoardTemperature8", "BoardTemperature9", "BoardTemperature10", "BoardTemperature11", "BoardTemperature12", "BoardTemperature13", "BoardTemperature14", "BoardTemperature15"}

func startIncomingListening() error {
	var scheme = driver.Config.IncomingSchema
	var brokerUrl = driver.Config.IncomingHost
	var brokerPort = driver.Config.IncomingPort
	var username = driver.Config.IncomingUser
	var password = driver.Config.IncomingPassword
	var mqttClientId = driver.Config.IncomingClientId
	var qos = byte(driver.Config.IncomingQos)
	var keepAlive = driver.Config.IncomingKeepAlive
	var topic = driver.Config.IncomingTopic

	uri := &url.URL{
		Scheme: strings.ToLower(scheme),
		Host:   fmt.Sprintf("%s:%d", brokerUrl, brokerPort),
		User:   url.UserPassword(username, password),
	}

	client, err := createClient(mqttClientId, uri, keepAlive)
	if err != nil {
		return err
	}

	defer func() {
		if client.IsConnected() {
			client.Disconnect(5000)
		}
	}()

	token := client.Subscribe(topic, qos, onIncomingDataReceived)
	if token.Wait() && token.Error() != nil {
		driver.Logger.Info(fmt.Sprintf("[Incoming listener] Stop incoming data listening. Cause:%v", token.Error()))
		return token.Error()
	}

	driver.Logger.Info("[Incoming listener] Start incoming data listening. ")
	select {}
}

func onIncomingDataReceived(client mqtt.Client, message mqtt.Message) {

	driver.Logger.Info(fmt.Sprintf("[Incoming listener] Incoming reading received: topic=%v msg=%v", message.Topic(), string(message.Payload())))

	// var ep EnersysPayload

	// json.Unmarshal(message.Payload(), &ep)

	payload := string(message.Payload())
	payloadArray := strings.Split(payload, ",")

	driver.Logger.Info(fmt.Sprintf("[------->MAG-Incoming listener] array length %d:", len(payloadArray)))

	if len(payloadArray) != 111 {
		return
	}

	deviceName := strings.TrimSpace(payloadArray[0])
	dateString := strings.TrimSpace(payloadArray[110])
	driver.Logger.Info(fmt.Sprintf("[------->MAG-Incoming listener] dateString:", dateString))
	t, _ := time.Parse(`01/02/2006 15:04:05.000`, dateString)
	tms := t.UTC().UnixNano() / 1000000

	var dataArray []string = payloadArray[1:110]

	service := sdk.RunningService()

	for i, v := range dataArray {
		fmt.Printf("Value[%d] = %s - %s\n", i, v, metrics[i])

		// cmd := data["cmd"].(string)
		devResource := metrics[i]

		reading := strings.TrimSpace(dataArray[94])

		deviceObject, ok := service.DeviceResource(deviceName, devResource, "get")
		if !ok {
			driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
			return
		}

		req := sdkModel.CommandRequest{
			DeviceResourceName: devResource,
			Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
		}

		result, err := newResult(req, reading, tms)

		driver.Logger.Info(fmt.Sprintf("[------->MAG-Incoming listener] NewResult:", result))

		if err != nil {
			driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
			return
		}

		asyncValues := &sdkModel.AsyncValues{
			DeviceName:    deviceName,
			CommandValues: []*sdkModel.CommandValue{result},
		}

		driver.AsyncCh <- asyncValues
	}

}

func onIncomingDataReceivedWithJson(client mqtt.Client, message mqtt.Message) {

	driver.Logger.Info(fmt.Sprintf("[Incoming listener] Incoming reading received: topic=%v msg=%v", message.Topic(), string(message.Payload())))

	var ep EnersysPayload

	json.Unmarshal(message.Payload(), &ep)

	deviceName := strings.TrimSpace(ep.DeviceID)

	payloadData := ep.Timeseriespayload[0].Data

	payloadDataArray := strings.Split(payloadData, ",")

	dateString := strings.TrimSpace(payloadDataArray[109])
	driver.Logger.Info(fmt.Sprintf("[------->MAG-Incoming listener] dateString:", dateString))
	t, _ := time.Parse(`01/02/2006 15:04:05.000`, dateString)
	tms := t.UTC().UnixNano() / 1000000

	var dataArray []string = payloadDataArray[0:109]

	service := sdk.RunningService()

	for i, v := range dataArray {
		fmt.Printf("Value[%d] = %s - %s\n", i, v, metrics[i])

		// cmd := data["cmd"].(string)
		devResource := metrics[i]

		reading := strings.TrimSpace(dataArray[94])

		deviceObject, ok := service.DeviceResource(deviceName, devResource, "get")
		if !ok {
			driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No DeviceObject found : topic=%v msg=%v", message.Topic(), string(message.Payload())))
			return
		}

		req := sdkModel.CommandRequest{
			DeviceResourceName: devResource,
			Type:               sdkModel.ParseValueType(deviceObject.Properties.Value.Type),
		}

		result, err := newResult(req, reading, tms)

		driver.Logger.Info(fmt.Sprintf("[------->MAG-Incoming listener] NewResult:", result))

		if err != nil {
			driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored.   topic=%v msg=%v error=%v", message.Topic(), string(message.Payload()), err))
			return
		}

		asyncValues := &sdkModel.AsyncValues{
			DeviceName:    deviceName,
			CommandValues: []*sdkModel.CommandValue{result},
		}

		driver.AsyncCh <- asyncValues
	}

}

func checkDataWithKey(data map[string]interface{}, key string) bool {
	val, ok := data[key]
	if !ok {
		driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. No %v found : msg=%v", key, data))
		return false
	}

	switch val.(type) {
	case string:
		return true
	default:
		driver.Logger.Warn(fmt.Sprintf("[Incoming listener] Incoming reading ignored. %v should be string : msg=%v", key, data))
		return false
	}
}
