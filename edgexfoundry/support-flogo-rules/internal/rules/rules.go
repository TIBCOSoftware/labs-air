package rules

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/project-flogo/rules/common/model"
	"github.com/project-flogo/rules/config"
	"github.com/project-flogo/rules/ruleapi"
)

type ledBody struct {
	Led string
}

// CreateRules - creates rules
func CreateRules(rs model.RuleSession, rulesDefFilename string) {

	// Check for Sensor values and call cmds when action is triggered
	//
	rule0 := ruleapi.NewRule("Concept Init")
	rule0.AddCondition("c1", []string{"RotaryAngleSensor", "Led"}, initCond, nil)
	rule0.SetAction(initAction)
	rule0.SetContext("This is contex init")
	rs.AddRule(rule0)

	rule1 := ruleapi.NewRule("Check Machine Abnormalities")
	rule1.AddCondition("c1", []string{"Reading"}, machineAbnormalCond, nil)
	rule1.SetAction(machineAbnormalAction)
	rule1.SetContext("This is contex for machine abnormal value")
	rs.AddRule(rule1)
	LoggingClient.Info(fmt.Sprintf("Rule added: [%s]\n", rule1.GetName()))

	rule2 := ruleapi.NewRule("Check Machine Normal")
	rule2.AddCondition("c1", []string{"Reading"}, machineNormalCond, nil)
	rule2.SetAction(machineNormalAction)
	rule2.SetContext("This is contex for machine normal value")
	rs.AddRule(rule2)

	rule3 := ruleapi.NewRule("Check Light Sensor Changes")
	rule3.AddCondition("c1", []string{"Reading", "LightSensor"}, lightSensorChangeCond, nil)
	rule3.SetAction(lightSensorChangeAction)
	rule3.SetContext("This is contex for light sensor change")
	rule3.SetPriority(1)
	rs.AddRule(rule3)

}

// RegisterConditionsAndActions - register rule conditions and actions
func RegisterConditionsAndActions() {

	LoggingClient.Info(fmt.Sprintf("Register Conditions and actions\n"))

	config.RegisterConditionEvaluator("initCond", initCond)
	config.RegisterActionFunction("initAction", initAction)

	config.RegisterConditionEvaluator("machineAbnormalCond", machineAbnormalCond)
	config.RegisterActionFunction("machineAbnormalAction", machineAbnormalAction)

	config.RegisterConditionEvaluator("machineNormalCond", machineNormalCond)
	config.RegisterActionFunction("machineNormalAction", machineNormalAction)

	config.RegisterConditionEvaluator("lightSensorChangeCond", lightSensorChangeCond)
	config.RegisterActionFunction("lightSensorChangeAction", lightSensorChangeAction)
}

func initCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	return false
}

func initAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Info(fmt.Sprintf("Rule fired: [%s]\n", ruleName))
}

func lightSensorChangeCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	condResult := false

	rt := tuples["Reading"]
	lst := tuples["LightSensor"]
	if rt == nil || lst == nil {
		LoggingClient.Error("Should not get a nil tuple in FilterCondition! This is an error")
		return false
	}

	rtDevice, _ := rt.GetString("device")
	rtInstrument, _ := rt.GetString("instrument")
	lstDevice, _ := lst.GetString("device")

	if rtInstrument == "LightSensor" && rtDevice == lstDevice {
		rtValue, _ := rt.GetInt("value")
		lstValue, _ := lst.GetInt("value")
		if rtValue != lstValue {
			condResult = true
		}
	}

	return condResult
}

func lightSensorChangeAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Info(fmt.Sprintf("Rule fired: [%s]\n", ruleName))

	rt := tuples["Reading"]
	lst := tuples["LightSensor"].(model.MutableTuple)
	if rt == nil || lst == nil {
		LoggingClient.Error("Should not get a nil tuple in FilterCondition! This is an error")
		return
	}

	rtDevice, _ := rt.GetString("device")
	lstDevice, _ := lst.GetString("device")

	if rtDevice == lstDevice {
		// Update concept
		rtValue, _ := rt.GetInt("value")
		lst.SetInt(nil, "value", rtValue)

		device, _ := lst.GetString("device")
		LoggingClient.Info(fmt.Sprintf("Light Sensor: Device = [%s], value = [%d] changed\n", device, rtValue))
	}
}

func machineAbnormalCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	condResult := false

	t1 := tuples["Reading"]
	if t1 == nil {
		LoggingClient.Error("Should not get a nil tuple in FilterCondition! This is an error")
		return false
	}
	device, _ := t1.GetString("device")
	instrument, _ := t1.GetString("instrument")

	if device == "mesh-argon-10" && instrument == "RotaryAngleSensor" {
		value, _ := t1.GetInt("value")

		// If rotary angle for machine is low, check parts values
		if value < 500 {

			condResult = true
		}
	}

	return condResult
}

func machineNormalCond(ruleName string, condName string, tuples map[model.TupleType]model.Tuple, ctx model.RuleContext) bool {
	LoggingClient.Debug(fmt.Sprintf("Condition Evaluated: [%s]-[%s]\n", ruleName, condName))

	condResult := false

	t1 := tuples["Reading"]
	if t1 == nil {
		LoggingClient.Error("Should not get a nil tuple in FilterCondition! This is an error")
		return false
	}
	device, _ := t1.GetString("device")
	instrument, _ := t1.GetString("instrument")

	if device == "mesh-argon-10" && instrument == "RotaryAngleSensor" {
		value, _ := t1.GetInt("value")

		if value >= 500 {
			condResult = true
		}
	}

	return condResult
}

func machineAbnormalAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Info(fmt.Sprintf("Rule fired: [%s]\n", ruleName))

	t1 := tuples["Reading"]
	if t1 == nil {
		LoggingClient.Error("Should not get a nil tuple in FilterCondition! This is an error")
		return
	}

	value, _ := t1.GetInt("value")
	device, _ := t1.GetString("device")
	instrument, _ := t1.GetString("instrument")

	// Get rotary angle concept and update value
	rat := GetTuple(rs, device, instrument)
	rat.SetInt(nil, "value", value)

	// Get light sensor values
	ls1 := GetTuple(rs, "mesh-xenon-11", "LightSensor")
	ls2 := GetTuple(rs, "mesh-xenon-12", "LightSensor")

	alarm := false
	ls1Value := 0
	ls2Value := 0

	if ls1 == nil && ls2 == nil {
		alarm = true
	} else if ls1 == nil {
		ls2Value, _ = ls2.GetInt("value")
		if ls2Value < 100 {
			alarm = true
		}
	} else if ls2 == nil {
		ls1Value, _ = ls1.GetInt("value")
		if ls1Value < 100 {
			alarm = true
		}
	} else {
		ls1Value, _ = ls1.GetInt("value")
		ls2Value, _ = ls2.GetInt("value")
		if ls1Value < 100 && ls2Value < 100 {
			alarm = true
		}
	}

	// Get led concept
	led := GetTuple(rs, device, "Led")
	ledValue, _ := led.GetBool("value")

	if alarm {
		LoggingClient.Info(fmt.Sprintf("Machine Alert for: device = [%s], ra_value = [%d] ls1_value = [%d] ls2_value = [%d] \n", device, value, ls1Value, ls2Value))

		if !ledValue {
			led.SetBool(nil, "value", true)
			sendDeviceComand("1")
		}

	} else {
		LoggingClient.Info(fmt.Sprintf("Machine Warning for: device = [%s], ra_value = [%d] ls1_value = [%d] ls2_value = [%d] \n", device, value, ls1Value, ls2Value))

		if ledValue {
			led.SetBool(nil, "value", false)
			sendDeviceComand("0")
		}

	}

}

func machineNormalAction(ctx context.Context, rs model.RuleSession, ruleName string, tuples map[model.TupleType]model.Tuple, ruleCtx model.RuleContext) {
	LoggingClient.Info(fmt.Sprintf("Rule fired: [%s]\n", ruleName))

	t1 := tuples["Reading"]
	if t1 == nil {
		LoggingClient.Info("Should not get a nil tuple in FilterCondition! This is an error")
		return
	}

	value, _ := t1.GetInt("value")
	device, _ := t1.GetString("device")
	instrument, _ := t1.GetString("instrument")

	// Get rotary angle concept and update value
	rat := GetTuple(rs, device, instrument)
	rat.SetInt(nil, "value", value)

	LoggingClient.Info(fmt.Sprintf("Machine: name = [%s], value = [%d] is normal\n", device, value))

	sendDeviceComand("0")
}

func sendDeviceComand(value string) {

	data := ledBody{
		Led: value,
	}

	d, err := json.Marshal(data)

	if err != nil {
		LoggingClient.Error(fmt.Sprintf("json.Marshal() failed with '%s'\n", err.Error()))
	}

	client := &http.Client{}
	client.Timeout = time.Second * 15

	// uri := "http://localhost:49982/api/v1/device/all/Led"
	uri := "http://localhost:49982/api/v1/device/name/mesh-argon-10/Led"
	body := bytes.NewBuffer(d)
	req, err := http.NewRequest(http.MethodPut, uri, body)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("http.NewRequest() failed with '%s'\n", err.Error()))
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	resp, err := client.Do(req)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("client.Do() failed with '%s'\n", err.Error()))
	}

	defer resp.Body.Close()
	d, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("ioutil.ReadAll() failed with '%s'\n", err.Error()))
	}

	LoggingClient.Info(fmt.Sprintf("Response status code: %d, text:\n%s\n", resp.StatusCode, string(d)))

}

// GetOrCreateTuple - Gets or create an assertedtuple
func GetOrCreateTuple(rs model.RuleSession, device, instrument, value string) model.MutableTuple {

	// Check if tuple already asserted
	tupleType := model.TupleType(instrument)
	tk, _ := model.NewTupleKeyWithKeyValues(tupleType, device)

	conceptOld := rs.GetAssertedTuple(tk)

	if conceptOld == nil {
		concept, _ := model.NewTupleWithKeyValues(tupleType, device)

		switch instrument {
		case "LightSensor", "RotaryAngleSensor":
			concept.SetInt(nil, "value", -999)
		case "Button", "Led":
			newVal, _ := strconv.ParseBool(value)
			concept.SetBool(nil, "value", newVal)
		default:
			concept.SetString(nil, "value", "")
		}

		err := rs.Assert(nil, concept)

		if err != nil {
			LoggingClient.Error(fmt.Sprintf("Assert failed for device-instrument: [%s]-[%s]\n", device, instrument))
		}

		return concept
	} else {
		concept := conceptOld.(model.MutableTuple)

		return concept
	}

}

// GetTuple - gets an asserted tuple
func GetTuple(rs model.RuleSession, device, instrument string) model.MutableTuple {

	LoggingClient.Debug(fmt.Sprintf("Get Concept for device-instrument: [%s]-[%s]\n", device, instrument))

	tupleType := model.TupleType(instrument)
	tk, _ := model.NewTupleKeyWithKeyValues(tupleType, device)

	concept := rs.GetAssertedTuple(tk)

	if concept == nil {
		LoggingClient.Debug(fmt.Sprintf("Concept not found for device-instrument: [%s]-[%s]\n", device, instrument))
		return nil
	}

	return concept.(model.MutableTuple)

}
