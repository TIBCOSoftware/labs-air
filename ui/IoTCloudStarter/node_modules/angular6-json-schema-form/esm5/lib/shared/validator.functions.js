import * as tslib_1 from "tslib";
import { from, Observable } from 'rxjs';
/**
 * '_executeValidators' utility function
 *
 * Validates a control against an array of validators, and returns
 * an array of the same length containing a combination of error messages
 * (from invalid validators) and null values (from valid validators)
 *
 * //  { AbstractControl } control - control to validate
 * //  { IValidatorFn[] } validators - array of validators
 * //  { boolean } invert - invert?
 * // { PlainObject[] } - array of nulls and error message
 */
export function _executeValidators(control, validators, invert) {
    if (invert === void 0) { invert = false; }
    return validators.map(function (validator) { return validator(control, invert); });
}
/**
 * '_executeAsyncValidators' utility function
 *
 * Validates a control against an array of async validators, and returns
 * an array of observabe results of the same length containing a combination of
 * error messages (from invalid validators) and null values (from valid ones)
 *
 * //  { AbstractControl } control - control to validate
 * //  { AsyncIValidatorFn[] } validators - array of async validators
 * //  { boolean } invert - invert?
 * //  - array of observable nulls and error message
 */
export function _executeAsyncValidators(control, validators, invert) {
    if (invert === void 0) { invert = false; }
    return validators.map(function (validator) { return validator(control, invert); });
}
/**
 * '_mergeObjects' utility function
 *
 * Recursively Merges one or more objects into a single object with combined keys.
 * Automatically detects and ignores null and undefined inputs.
 * Also detects duplicated boolean 'not' keys and XORs their values.
 *
 * //  { PlainObject[] } objects - one or more objects to merge
 * // { PlainObject } - merged object
 */
export function _mergeObjects() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    var e_1, _a, e_2, _b;
    var mergedObject = {};
    try {
        for (var objects_1 = tslib_1.__values(objects), objects_1_1 = objects_1.next(); !objects_1_1.done; objects_1_1 = objects_1.next()) {
            var currentObject = objects_1_1.value;
            if (isObject(currentObject)) {
                try {
                    for (var _c = tslib_1.__values(Object.keys(currentObject)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var key = _d.value;
                        var currentValue = currentObject[key];
                        var mergedValue = mergedObject[key];
                        mergedObject[key] = !isDefined(mergedValue) ? currentValue :
                            key === 'not' && isBoolean(mergedValue, 'strict') &&
                                isBoolean(currentValue, 'strict') ? xor(mergedValue, currentValue) :
                                getType(mergedValue) === 'object' && getType(currentValue) === 'object' ?
                                    _mergeObjects(mergedValue, currentValue) :
                                    currentValue;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (objects_1_1 && !objects_1_1.done && (_a = objects_1.return)) _a.call(objects_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return mergedObject;
}
/**
 * '_mergeErrors' utility function
 *
 * Merges an array of objects.
 * Used for combining the validator errors returned from 'executeValidators'
 *
 * //  { PlainObject[] } arrayOfErrors - array of objects
 * // { PlainObject } - merged object, or null if no usable input objectcs
 */
export function _mergeErrors(arrayOfErrors) {
    var mergedErrors = _mergeObjects.apply(void 0, tslib_1.__spread(arrayOfErrors));
    return isEmpty(mergedErrors) ? null : mergedErrors;
}
/**
 * 'isDefined' utility function
 *
 * Checks if a variable contains a value of any type.
 * Returns true even for otherwise 'falsey' values of 0, '', and false.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined or null, otherwise true
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * 'hasValue' utility function
 *
 * Checks if a variable contains a value.
 * Returs false for null, undefined, or a zero-length strng, '',
 * otherwise returns true.
 * (Stricter than 'isDefined' because it also returns false for '',
 * though it stil returns true for otherwise 'falsey' values 0 and false.)
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
}
/**
 * 'isEmpty' utility function
 *
 * Similar to !hasValue, but also returns true for empty arrays and objects.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function isEmpty(value) {
    if (isArray(value)) {
        return !value.length;
    }
    if (isObject(value)) {
        return !Object.keys(value).length;
    }
    return value === undefined || value === null || value === '';
}
/**
 * 'isString' utility function
 *
 * Checks if a value is a string.
 *
 * //   value - the value to check
 * // { boolean } - true if string, false if not
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * 'isNumber' utility function
 *
 * Checks if a value is a regular number, numeric string, or JavaScript Date.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { boolean } - true if number, false if not
 */
export function isNumber(value, strict) {
    if (strict === void 0) { strict = false; }
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0;
}
/**
 * 'isInteger' utility function
 *
 * Checks if a value is an integer.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // {boolean } - true if number, false if not
 */
export function isInteger(value, strict) {
    if (strict === void 0) { strict = false; }
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0 && value % 1 === 0;
}
/**
 * 'isBoolean' utility function
 *
 * Checks if a value is a boolean.
 *
 * //   value - the value to check
 * //  { any = null } option - if 'strict', also checks JavaScript type
 *                              if TRUE or FALSE, checks only for that value
 * // { boolean } - true if boolean, false if not
 */
export function isBoolean(value, option) {
    if (option === void 0) { option = null; }
    if (option === 'strict') {
        return value === true || value === false;
    }
    if (option === true) {
        return value === true || value === 1 || value === 'true' || value === '1';
    }
    if (option === false) {
        return value === false || value === 0 || value === 'false' || value === '0';
    }
    return value === true || value === 1 || value === 'true' || value === '1' ||
        value === false || value === 0 || value === 'false' || value === '0';
}
export function isFunction(item) {
    return typeof item === 'function';
}
export function isObject(item) {
    return item !== null && typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Object]';
}
export function isArray(item) {
    return Array.isArray(item) ||
        Object.prototype.toString.call(item) === '[object Array]';
}
export function isDate(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Date]';
}
export function isMap(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Map]';
}
export function isSet(item) {
    return typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Set]';
}
export function isSymbol(item) {
    return typeof item === 'symbol';
}
/**
 * 'getType' function
 *
 * Detects the JSON Schema Type of a value.
 * By default, detects numbers and integers even if formatted as strings.
 * (So all integers are also numbers, and any number may also be a string.)
 * However, it only detects true boolean values (to detect boolean values
 * in non-boolean formats, use isBoolean() instead).
 *
 * If passed a second optional parameter of 'strict', it will only detect
 * numbers and integers if they are formatted as JavaScript numbers.
 *
 * Examples:
 * getType('10.5') = 'number'
 * getType(10.5) = 'number'
 * getType('10') = 'integer'
 * getType(10) = 'integer'
 * getType('true') = 'string'
 * getType(true) = 'boolean'
 * getType(null) = 'null'
 * getType({ }) = 'object'
 * getType([]) = 'array'
 *
 * getType('10.5', 'strict') = 'string'
 * getType(10.5, 'strict') = 'number'
 * getType('10', 'strict') = 'string'
 * getType(10, 'strict') = 'integer'
 * getType('true', 'strict') = 'string'
 * getType(true, 'strict') = 'boolean'
 *
 * //   value - value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { SchemaType }
 */
export function getType(value, strict) {
    if (strict === void 0) { strict = false; }
    if (!isDefined(value)) {
        return 'null';
    }
    if (isArray(value)) {
        return 'array';
    }
    if (isObject(value)) {
        return 'object';
    }
    if (isBoolean(value, 'strict')) {
        return 'boolean';
    }
    if (isInteger(value, strict)) {
        return 'integer';
    }
    if (isNumber(value, strict)) {
        return 'number';
    }
    if (isString(value) || (!strict && isDate(value))) {
        return 'string';
    }
    return null;
}
/**
 * 'isType' function
 *
 * Checks wether an input (probably string) value contains data of
 * a specified JSON Schema type
 *
 * //  { PrimitiveValue } value - value to check
 * //  { SchemaPrimitiveType } type - type to check
 * // { boolean }
 */
export function isType(value, type) {
    switch (type) {
        case 'string':
            return isString(value) || isDate(value);
        case 'number':
            return isNumber(value);
        case 'integer':
            return isInteger(value);
        case 'boolean':
            return isBoolean(value);
        case 'null':
            return !hasValue(value);
        default:
            console.error("isType error: \"" + type + "\" is not a recognized type.");
            return null;
    }
}
/**
 * 'isPrimitive' function
 *
 * Checks wether an input value is a JavaScript primitive type:
 * string, number, boolean, or null.
 *
 * //   value - value to check
 * // { boolean }
 */
export function isPrimitive(value) {
    return (isString(value) || isNumber(value) ||
        isBoolean(value, 'strict') || value === null);
}
/**
 * 'toJavaScriptType' function
 *
 * Converts an input (probably string) value to a JavaScript primitive type -
 * 'string', 'number', 'boolean', or 'null' - before storing in a JSON object.
 *
 * Does not coerce values (other than null), and only converts the types
 * of values that would otherwise be valid.
 *
 * If the optional third parameter 'strictIntegers' is TRUE, and the
 * JSON Schema type 'integer' is specified, it also verifies the input value
 * is an integer and, if it is, returns it as a JaveScript number.
 * If 'strictIntegers' is FALSE (or not set) the type 'integer' is treated
 * exactly the same as 'number', and allows decimals.
 *
 * Valid Examples:
 * toJavaScriptType('10',   'number' ) = 10   // '10'   is a number
 * toJavaScriptType('10',   'integer') = 10   // '10'   is also an integer
 * toJavaScriptType( 10,    'integer') = 10   //  10    is still an integer
 * toJavaScriptType( 10,    'string' ) = '10' //  10    can be made into a string
 * toJavaScriptType('10.5', 'number' ) = 10.5 // '10.5' is a number
 *
 * Invalid Examples:
 * toJavaScriptType('10.5', 'integer') = null // '10.5' is not an integer
 * toJavaScriptType( 10.5,  'integer') = null //  10.5  is still not an integer
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - types to convert to
 * //  { boolean = false } strictIntegers - if FALSE, treat integers as numbers
 * // { PrimitiveValue }
 */
export function toJavaScriptType(value, types, strictIntegers) {
    if (strictIntegers === void 0) { strictIntegers = true; }
    if (!isDefined(value)) {
        return null;
    }
    if (isString(types)) {
        types = [types];
    }
    if (strictIntegers && inArray('integer', types)) {
        if (isInteger(value, 'strict')) {
            return value;
        }
        if (isInteger(value)) {
            return parseInt(value, 10);
        }
    }
    if (inArray('number', types) || (!strictIntegers && inArray('integer', types))) {
        if (isNumber(value, 'strict')) {
            return value;
        }
        if (isNumber(value)) {
            return parseFloat(value);
        }
    }
    if (inArray('string', types)) {
        if (isString(value)) {
            return value;
        }
        // If value is a date, and types includes 'string',
        // convert the date to a string
        if (isDate(value)) {
            return value.toISOString().slice(0, 10);
        }
        if (isNumber(value)) {
            return value.toString();
        }
    }
    // If value is a date, and types includes 'integer' or 'number',
    // but not 'string', convert the date to a number
    if (isDate(value) && (inArray('integer', types) || inArray('number', types))) {
        return value.getTime();
    }
    if (inArray('boolean', types)) {
        if (isBoolean(value, true)) {
            return true;
        }
        if (isBoolean(value, false)) {
            return false;
        }
    }
    return null;
}
/**
 * 'toSchemaType' function
 *
 * Converts an input (probably string) value to the "best" JavaScript
 * equivalent available from an allowed list of JSON Schema types, which may
 * contain 'string', 'number', 'integer', 'boolean', and/or 'null'.
 * If necssary, it does progressively agressive type coersion.
 * It will not return null unless null is in the list of allowed types.
 *
 * Number conversion examples:
 * toSchemaType('10', ['number','integer','string']) = 10 // integer
 * toSchemaType('10', ['number','string']) = 10 // number
 * toSchemaType('10', ['string']) = '10' // string
 * toSchemaType('10.5', ['number','integer','string']) = 10.5 // number
 * toSchemaType('10.5', ['integer','string']) = '10.5' // string
 * toSchemaType('10.5', ['integer']) = 10 // integer
 * toSchemaType(10.5, ['null','boolean','string']) = '10.5' // string
 * toSchemaType(10.5, ['null','boolean']) = true // boolean
 *
 * String conversion examples:
 * toSchemaType('1.5x', ['boolean','number','integer','string']) = '1.5x' // string
 * toSchemaType('1.5x', ['boolean','number','integer']) = '1.5' // number
 * toSchemaType('1.5x', ['boolean','integer']) = '1' // integer
 * toSchemaType('1.5x', ['boolean']) = true // boolean
 * toSchemaType('xyz', ['number','integer','boolean','null']) = true // boolean
 * toSchemaType('xyz', ['number','integer','null']) = null // null
 * toSchemaType('xyz', ['number','integer']) = 0 // number
 *
 * Boolean conversion examples:
 * toSchemaType('1', ['integer','number','string','boolean']) = 1 // integer
 * toSchemaType('1', ['number','string','boolean']) = 1 // number
 * toSchemaType('1', ['string','boolean']) = '1' // string
 * toSchemaType('1', ['boolean']) = true // boolean
 * toSchemaType('true', ['number','string','boolean']) = 'true' // string
 * toSchemaType('true', ['boolean']) = true // boolean
 * toSchemaType('true', ['number']) = 0 // number
 * toSchemaType(true, ['number','string','boolean']) = true // boolean
 * toSchemaType(true, ['number','string']) = 'true' // string
 * toSchemaType(true, ['number']) = 1 // number
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - allowed types to convert to
 * // { PrimitiveValue }
 */
export function toSchemaType(value, types) {
    if (!isArray(types)) {
        types = [types];
    }
    if (types.includes('null') && !hasValue(value)) {
        return null;
    }
    if (types.includes('boolean') && !isBoolean(value, 'strict')) {
        return value;
    }
    if (types.includes('integer')) {
        var testValue = toJavaScriptType(value, 'integer');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if (types.includes('number')) {
        var testValue = toJavaScriptType(value, 'number');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if ((isString(value) || isNumber(value, 'strict')) &&
        types.includes('string')) { // Convert number to string
        return toJavaScriptType(value, 'string');
    }
    if (types.includes('boolean') && isBoolean(value)) {
        return toJavaScriptType(value, 'boolean');
    }
    if (types.includes('string')) { // Convert null & boolean to string
        if (value === null) {
            return '';
        }
        var testValue = toJavaScriptType(value, 'string');
        if (testValue !== null) {
            return testValue;
        }
    }
    if ((types.includes('number') ||
        types.includes('integer'))) {
        if (value === true) {
            return 1;
        } // Convert boolean & null to number
        if (value === false || value === null || value === '') {
            return 0;
        }
    }
    if (types.includes('number')) { // Convert mixed string to number
        var testValue = parseFloat(value);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('integer')) { // Convert string or number to integer
        var testValue = parseInt(value, 10);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('boolean')) { // Convert anything to boolean
        return !!value;
    }
    if ((types.includes('number') ||
        types.includes('integer')) && !types.includes('null')) {
        return 0; // If null not allowed, return 0 for non-convertable values
    }
}
/**
 * 'isPromise' function
 *
 * //   object
 * // { boolean }
 */
export function isPromise(object) {
    return !!object && typeof object.then === 'function';
}
/**
 * 'isObservable' function
 *
 * //   object
 * // { boolean }
 */
export function isObservable(object) {
    return !!object && typeof object.subscribe === 'function';
}
/**
 * '_toPromise' function
 *
 * //  { object } object
 * // { Promise<any> }
 */
export function _toPromise(object) {
    return isPromise(object) ? object : object.toPromise();
}
/**
 * 'toObservable' function
 *
 * //  { object } object
 * // { Observable<any> }
 */
export function toObservable(object) {
    var observable = isPromise(object) ? from(object) : object;
    if (isObservable(observable)) {
        return observable;
    }
    console.error('toObservable error: Expected validator to return Promise or Observable.');
    return new Observable();
}
/**
 * 'inArray' function
 *
 * Searches an array for an item, or one of a list of items, and returns true
 * as soon as a match is found, or false if no match.
 *
 * If the optional third parameter allIn is set to TRUE, and the item to find
 * is an array, then the function returns true only if all elements from item
 * are found in the array list, and false if any element is not found. If the
 * item to find is not an array, setting allIn to TRUE has no effect.
 *
 * //  { any|any[] } item - the item to search for
 * //   array - the array to search
 * //  { boolean = false } allIn - if TRUE, all items must be in array
 * // { boolean } - true if item(s) in array, false otherwise
 */
export function inArray(item, array, allIn) {
    if (allIn === void 0) { allIn = false; }
    if (!isDefined(item) || !isArray(array)) {
        return false;
    }
    return isArray(item) ?
        item[allIn ? 'every' : 'some'](function (subItem) { return array.includes(subItem); }) :
        array.includes(item);
}
/**
 * 'xor' utility function - exclusive or
 *
 * Returns true if exactly one of two values is truthy.
 *
 * //   value1 - first value to check
 * //   value2 - second value to check
 * // { boolean } - true if exactly one input value is truthy, false if not
 */
export function xor(value1, value2) {
    return (!!value1 && !value2) || (!value1 && !!value2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvc2hhcmVkL3ZhbGlkYXRvci5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBZ0R4Qzs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQWM7SUFBZCx1QkFBQSxFQUFBLGNBQWM7SUFDcEUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQWM7SUFBZCx1QkFBQSxFQUFBLGNBQWM7SUFDekUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsYUFBYTtJQUFDLGlCQUFVO1NBQVYsVUFBVSxFQUFWLHFCQUFVLEVBQVYsSUFBVTtRQUFWLDRCQUFVOzs7SUFDdEMsSUFBTSxZQUFZLEdBQWdCLEVBQUcsQ0FBQzs7UUFDdEMsS0FBNEIsSUFBQSxZQUFBLGlCQUFBLE9BQU8sQ0FBQSxnQ0FBQSxxREFBRTtZQUFoQyxJQUFNLGFBQWEsb0JBQUE7WUFDdEIsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7O29CQUMzQixLQUFrQixJQUFBLEtBQUEsaUJBQUEsTUFBTSxD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VUFBVSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFhO0lBQWIsc0JBQUEsRUFBQSxhQUFhO0lBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFBRSxPQUFPLEtBQUssQ0FBQztLQUFFO0lBQzFELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTTtJQUNoQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBmcm9tLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogVmFsaWRhdG9yIHV0aWxpdHkgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBWYWxpZGF0b3IgYW5kIGVycm9yIHV0aWxpdGllczpcbiAqICAgX2V4ZWN1dGVWYWxpZGF0b3JzLCBfZXhlY3V0ZUFzeW5jVmFsaWRhdG9ycywgX21lcmdlT2JqZWN0cywgX21lcmdlRXJyb3JzXG4gKlxuICogSW5kaXZpZHVhbCB2YWx1ZSBjaGVja2luZzpcbiAqICAgaXNEZWZpbmVkLCBoYXNWYWx1ZSwgaXNFbXB0eVxuICpcbiAqIEluZGl2aWR1YWwgdHlwZSBjaGVja2luZzpcbiAqICAgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0ludGVnZXIsIGlzQm9vbGVhbiwgaXNGdW5jdGlvbiwgaXNPYmplY3QsIGlzQXJyYXksXG4gKiAgIGlzTWFwLCBpc1NldCwgaXNQcm9taXNlLCBpc09ic2VydmFibGVcbiAqXG4gKiBNdWx0aXBsZSB0eXBlIGNoZWNraW5nIGFuZCBmaXhpbmc6XG4gKiAgIGdldFR5cGUsIGlzVHlwZSwgaXNQcmltaXRpdmUsIHRvSmF2YVNjcmlwdFR5cGUsIHRvU2NoZW1hVHlwZSxcbiAqICAgX3RvUHJvbWlzZSwgdG9PYnNlcnZhYmxlXG4gKlxuICogVXRpbGl0eSBmdW5jdGlvbnM6XG4gKiAgIGluQXJyYXksIHhvclxuICpcbiAqIFR5cGVzY3JpcHQgdHlwZXMgYW5kIGludGVyZmFjZXM6XG4gKiAgIFNjaGVtYVByaW1pdGl2ZVR5cGUsIFNjaGVtYVR5cGUsIEphdmFTY3JpcHRQcmltaXRpdmVUeXBlLCBKYXZhU2NyaXB0VHlwZSxcbiAqICAgUHJpbWl0aXZlVmFsdWUsIFBsYWluT2JqZWN0LCBJVmFsaWRhdG9yRm4sIEFzeW5jSVZhbGlkYXRvckZuXG4gKlxuICogTm90ZTogJ0lWYWxpZGF0b3JGbicgaXMgc2hvcnQgZm9yICdpbnZlcnRhYmxlIHZhbGlkYXRvciBmdW5jdGlvbicsXG4gKiAgIHdoaWNoIGlzIGEgdmFsaWRhdG9yIGZ1bmN0aW9ucyB0aGF0IGFjY2VwdHMgYW4gb3B0aW9uYWwgc2Vjb25kXG4gKiAgIGFyZ3VtZW50IHdoaWNoLCBpZiBzZXQgdG8gVFJVRSwgY2F1c2VzIHRoZSB2YWxpZGF0b3IgdG8gcGVyZm9ybVxuICogICB0aGUgb3Bwb3NpdGUgb2YgaXRzIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICovXG5cbmV4cG9ydCB0eXBlIFNjaGVtYVByaW1pdGl2ZVR5cGUgPVxuICAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2ludGVnZXInIHwgJ2Jvb2xlYW4nIHwgJ251bGwnO1xuZXhwb3J0IHR5cGUgU2NoZW1hVHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnaW50ZWdlcicgfCAnYm9vbGVhbicgfCAnbnVsbCcgfCAnb2JqZWN0JyB8ICdhcnJheSc7XG5leHBvcnQgdHlwZSBKYXZhU2NyaXB0UHJpbWl0aXZlVHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnYm9vbGVhbicgfCAnbnVsbCcgfCAndW5kZWZpbmVkJztcbmV4cG9ydCB0eXBlIEphdmFTY3JpcHRUeXBlID1cbiAgJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdib29sZWFuJyB8ICdudWxsJyB8ICd1bmRlZmluZWQnIHwgJ29iamVjdCcgfCAnYXJyYXknIHxcbiAgJ21hcCcgfCAnc2V0JyB8ICdhcmd1bWVudHMnIHwgJ2RhdGUnIHwgJ2Vycm9yJyB8ICdmdW5jdGlvbicgfCAnanNvbicgfFxuICAnbWF0aCcgfCAncmVnZXhwJzsgLy8gTm90ZTogdGhpcyBsaXN0IGlzIGluY29tcGxldGVcbmV4cG9ydCB0eXBlIFByaW1pdGl2ZVZhbHVlID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQ7XG5leHBvcnQgaW50ZXJmYWNlIFBsYWluT2JqZWN0IHsgW2s6IHN0cmluZ106IGFueTsgfVxuXG5leHBvcnQgdHlwZSBJVmFsaWRhdG9yRm4gPSAoYzogQWJzdHJhY3RDb250cm9sLCBpPzogYm9vbGVhbikgPT4gUGxhaW5PYmplY3Q7XG5leHBvcnQgdHlwZSBBc3luY0lWYWxpZGF0b3JGbiA9IChjOiBBYnN0cmFjdENvbnRyb2wsIGk/OiBib29sZWFuKSA9PiBhbnk7XG5cbi8qKlxuICogJ19leGVjdXRlVmFsaWRhdG9ycycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIFZhbGlkYXRlcyBhIGNvbnRyb2wgYWdhaW5zdCBhbiBhcnJheSBvZiB2YWxpZGF0b3JzLCBhbmQgcmV0dXJuc1xuICogYW4gYXJyYXkgb2YgdGhlIHNhbWUgbGVuZ3RoIGNvbnRhaW5pbmcgYSBjb21iaW5hdGlvbiBvZiBlcnJvciBtZXNzYWdlc1xuICogKGZyb20gaW52YWxpZCB2YWxpZGF0b3JzKSBhbmQgbnVsbCB2YWx1ZXMgKGZyb20gdmFsaWQgdmFsaWRhdG9ycylcbiAqXG4gKiAvLyAgeyBBYnN0cmFjdENvbnRyb2wgfSBjb250cm9sIC0gY29udHJvbCB0byB2YWxpZGF0ZVxuICogLy8gIHsgSVZhbGlkYXRvckZuW10gfSB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgdmFsaWRhdG9yc1xuICogLy8gIHsgYm9vbGVhbiB9IGludmVydCAtIGludmVydD9cbiAqIC8vIHsgUGxhaW5PYmplY3RbXSB9IC0gYXJyYXkgb2YgbnVsbHMgYW5kIGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sLCB2YWxpZGF0b3JzLCBpbnZlcnQgPSBmYWxzZSkge1xuICByZXR1cm4gdmFsaWRhdG9ycy5tYXAodmFsaWRhdG9yID0+IHZhbGlkYXRvcihjb250cm9sLCBpbnZlcnQpKTtcbn1cblxuLyoqXG4gKiAnX2V4ZWN1dGVBc3luY1ZhbGlkYXRvcnMnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBWYWxpZGF0ZXMgYSBjb250cm9sIGFnYWluc3QgYW4gYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9ycywgYW5kIHJldHVybnNcbiAqIGFuIGFycmF5IG9mIG9ic2VydmFiZSByZXN1bHRzIG9mIHRoZSBzYW1lIGxlbmd0aCBjb250YWluaW5nIGEgY29tYmluYXRpb24gb2ZcbiAqIGVycm9yIG1lc3NhZ2VzIChmcm9tIGludmFsaWQgdmFsaWRhdG9ycykgYW5kIG51bGwgdmFsdWVzIChmcm9tIHZhbGlkIG9uZXMpXG4gKlxuICogLy8gIHsgQWJzdHJhY3RDb250cm9sIH0gY29udHJvbCAtIGNvbnRyb2wgdG8gdmFsaWRhdGVcbiAqIC8vICB7IEFzeW5jSVZhbGlkYXRvckZuW10gfSB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9yc1xuICogLy8gIHsgYm9vbGVhbiB9IGludmVydCAtIGludmVydD9cbiAqIC8vICAtIGFycmF5IG9mIG9ic2VydmFibGUgbnVsbHMgYW5kIGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9leGVjdXRlQXN5bmNWYWxpZGF0b3JzKGNvbnRyb2wsIHZhbGlkYXRvcnMsIGludmVydCA9IGZhbHNlKSB7XG4gIHJldHVybiB2YWxpZGF0b3JzLm1hcCh2YWxpZGF0b3IgPT4gdmFsaWRhdG9yKGNvbnRyb2wsIGludmVydCkpO1xufVxuXG4vKipcbiAqICdfbWVyZ2VPYmplY3RzJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogUmVjdXJzaXZlbHkgTWVyZ2VzIG9uZSBvciBtb3JlIG9iamVjdHMgaW50byBhIHNpbmdsZSBvYmplY3Qgd2l0aCBjb21iaW5lZCBrZXlzLlxuICogQXV0b21hdGljYWxseSBkZXRlY3RzIGFuZCBpZ25vcmVzIG51bGwgYW5kIHVuZGVmaW5lZCBpbnB1dHMuXG4gKiBBbHNvIGRldGVjdHMgZHVwbGljYXRlZCBib29sZWFuICdub3QnIGtleXMgYW5kIFhPUnMgdGhlaXIgdmFsdWVzLlxuICpcbiAqIC8vICB7IFBsYWluT2JqZWN0W10gfSBvYmplY3RzIC0gb25lIG9yIG1vcmUgb2JqZWN0cyB0byBtZXJnZVxuICogLy8geyBQbGFpbk9iamVjdCB9IC0gbWVyZ2VkIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gX21lcmdlT2JqZWN0cyguLi5vYmplY3RzKSB7XG4gIGNvbnN0IG1lcmdlZE9iamVjdDogUGxhaW5PYmplY3QgPSB7IH07XG4gIGZvciAoY29uc3QgY3VycmVudE9iamVjdCBvZiBvYmplY3RzKSB7XG4gICAgaWYgKGlzT2JqZWN0KGN1cnJlbnRPYmplY3QpKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhjdXJyZW50T2JqZWN0KSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBjdXJyZW50T2JqZWN0W2tleV07XG4gICAgICAgIGNvbnN0IG1lcmdlZFZhbHVlID0gbWVyZ2VkT2JqZWN0W2tleV07XG4gICAgICAgIG1lcmdlZE9iamVjdFtrZXldID0gIWlzRGVmaW5lZChtZXJnZWRWYWx1ZSkgPyBjdXJyZW50VmFsdWUgOlxuICAgICAgICAgIGtleSA9PT0gJ25vdCcgJiYgaXNCb29sZWFuKG1lcmdlZFZhbHVlLCAnc3RyaWN0JykgJiZcbiAgICAgICAgICAgIGlzQm9vbGVhbihjdXJyZW50VmFsdWUsICdzdHJpY3QnKSA/IHhvcihtZXJnZWRWYWx1ZSwgY3VycmVudFZhbHVlKSA6XG4gICAgICAgICAgZ2V0VHlwZShtZXJnZWRWYWx1ZSkgPT09ICdvYmplY3QnICYmIGdldFR5cGUoY3VycmVudFZhbHVlKSA9PT0gJ29iamVjdCcgP1xuICAgICAgICAgICAgX21lcmdlT2JqZWN0cyhtZXJnZWRWYWx1ZSwgY3VycmVudFZhbHVlKSA6XG4gICAgICAgICAgICBjdXJyZW50VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtZXJnZWRPYmplY3Q7XG59XG5cbi8qKlxuICogJ19tZXJnZUVycm9ycycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIE1lcmdlcyBhbiBhcnJheSBvZiBvYmplY3RzLlxuICogVXNlZCBmb3IgY29tYmluaW5nIHRoZSB2YWxpZGF0b3IgZXJyb3JzIHJldHVybmVkIGZyb20gJ2V4ZWN1dGVWYWxpZGF0b3JzJ1xuICpcbiAqIC8vICB7IFBsYWluT2JqZWN0W10gfSBhcnJheU9mRXJyb3JzIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogLy8geyBQbGFpbk9iamVjdCB9IC0gbWVyZ2VkIG9iamVjdCwgb3IgbnVsbCBpZiBubyB1c2FibGUgaW5wdXQgb2JqZWN0Y3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9tZXJnZUVycm9ycyhhcnJheU9mRXJyb3JzKSB7XG4gIGNvbnN0IG1lcmdlZEVycm9ycyA9IF9tZXJnZU9iamVjdHMoLi4uYXJyYXlPZkVycm9ycyk7XG4gIHJldHVybiBpc0VtcHR5KG1lcmdlZEVycm9ycykgPyBudWxsIDogbWVyZ2VkRXJyb3JzO1xufVxuXG4vKipcbiAqICdpc0RlZmluZWQnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YXJpYWJsZSBjb250YWlucyBhIHZhbHVlIG9mIGFueSB0eXBlLlxuICogUmV0dXJucyB0cnVlIGV2ZW4gZm9yIG90aGVyd2lzZSAnZmFsc2V5JyB2YWx1ZXMgb2YgMCwgJycsIGFuZCBmYWxzZS5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIGZhbHNlIGlmIHVuZGVmaW5lZCBvciBudWxsLCBvdGhlcndpc2UgdHJ1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG4vKipcbiAqICdoYXNWYWx1ZScgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhcmlhYmxlIGNvbnRhaW5zIGEgdmFsdWUuXG4gKiBSZXR1cnMgZmFsc2UgZm9yIG51bGwsIHVuZGVmaW5lZCwgb3IgYSB6ZXJvLWxlbmd0aCBzdHJuZywgJycsXG4gKiBvdGhlcndpc2UgcmV0dXJucyB0cnVlLlxuICogKFN0cmljdGVyIHRoYW4gJ2lzRGVmaW5lZCcgYmVjYXVzZSBpdCBhbHNvIHJldHVybnMgZmFsc2UgZm9yICcnLFxuICogdGhvdWdoIGl0IHN0aWwgcmV0dXJucyB0cnVlIGZvciBvdGhlcndpc2UgJ2ZhbHNleScgdmFsdWVzIDAgYW5kIGZhbHNlLilcbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIGZhbHNlIGlmIHVuZGVmaW5lZCwgbnVsbCwgb3IgJycsIG90aGVyd2lzZSB0cnVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJyc7XG59XG5cbi8qKlxuICogJ2lzRW1wdHknIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBTaW1pbGFyIHRvICFoYXNWYWx1ZSwgYnV0IGFsc28gcmV0dXJucyB0cnVlIGZvciBlbXB0eSBhcnJheXMgYW5kIG9iamVjdHMuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSBmYWxzZSBpZiB1bmRlZmluZWQsIG51bGwsIG9yICcnLCBvdGhlcndpc2UgdHJ1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHsgcmV0dXJuICF2YWx1ZS5sZW5ndGg7IH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkgeyByZXR1cm4gIU9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGg7IH1cbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnO1xufVxuXG4vKipcbiAqICdpc1N0cmluZycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGEgc3RyaW5nLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBzdHJpbmcsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogJ2lzTnVtYmVyJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSByZWd1bGFyIG51bWJlciwgbnVtZXJpYyBzdHJpbmcsIG9yIEphdmFTY3JpcHQgRGF0ZS5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgbnVtYmVyLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmIChzdHJpY3QgJiYgdHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgdmFsdWUgIT09IHZhbHVlIC8gMDtcbn1cblxuLyoqXG4gKiAnaXNJbnRlZ2VyJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYW4gaW50ZWdlci5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7Ym9vbGVhbiB9IC0gdHJ1ZSBpZiBudW1iZXIsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmIChzdHJpY3QgJiYgdHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgIHZhbHVlICE9PSB2YWx1ZSAvIDAgJiYgdmFsdWUgJSAxID09PSAwO1xufVxuXG4vKipcbiAqICdpc0Jvb2xlYW4nIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhIGJvb2xlYW4uXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgYW55ID0gbnVsbCB9IG9wdGlvbiAtIGlmICdzdHJpY3QnLCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5cGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgVFJVRSBvciBGQUxTRSwgY2hlY2tzIG9ubHkgZm9yIHRoYXQgdmFsdWVcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBib29sZWFuLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQm9vbGVhbih2YWx1ZSwgb3B0aW9uOiBhbnkgPSBudWxsKSB7XG4gIGlmIChvcHRpb24gPT09ICdzdHJpY3QnKSB7IHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2U7IH1cbiAgaWYgKG9wdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnMSc7XG4gIH1cbiAgaWYgKG9wdGlvbiA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSAwIHx8IHZhbHVlID09PSAnZmFsc2UnIHx8IHZhbHVlID09PSAnMCc7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAndHJ1ZScgfHwgdmFsdWUgPT09ICcxJyB8fFxuICAgIHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJyB8fCB2YWx1ZSA9PT0gJzAnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpdGVtICE9PSBudWxsICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5KGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShpdGVtKSB8fFxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZShpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNYXAoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgPT09ICdbb2JqZWN0IE1hcF0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTZXQoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgPT09ICdbb2JqZWN0IFNldF0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTeW1ib2woaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogJ2dldFR5cGUnIGZ1bmN0aW9uXG4gKlxuICogRGV0ZWN0cyB0aGUgSlNPTiBTY2hlbWEgVHlwZSBvZiBhIHZhbHVlLlxuICogQnkgZGVmYXVsdCwgZGV0ZWN0cyBudW1iZXJzIGFuZCBpbnRlZ2VycyBldmVuIGlmIGZvcm1hdHRlZCBhcyBzdHJpbmdzLlxuICogKFNvIGFsbCBpbnRlZ2VycyBhcmUgYWxzbyBudW1iZXJzLCBhbmQgYW55IG51bWJlciBtYXkgYWxzbyBiZSBhIHN0cmluZy4pXG4gKiBIb3dldmVyLCBpdCBvbmx5IGRldGVjdHMgdHJ1ZSBib29sZWFuIHZhbHVlcyAodG8gZGV0ZWN0IGJvb2xlYW4gdmFsdWVzXG4gKiBpbiBub24tYm9vbGVhbiBmb3JtYXRzLCB1c2UgaXNCb29sZWFuKCkgaW5zdGVhZCkuXG4gKlxuICogSWYgcGFzc2VkIGEgc2Vjb25kIG9wdGlvbmFsIHBhcmFtZXRlciBvZiAnc3RyaWN0JywgaXQgd2lsbCBvbmx5IGRldGVjdFxuICogbnVtYmVycyBhbmQgaW50ZWdlcnMgaWYgdGhleSBhcmUgZm9ybWF0dGVkIGFzIEphdmFTY3JpcHQgbnVtYmVycy5cbiAqXG4gKiBFeGFtcGxlczpcbiAqIGdldFR5cGUoJzEwLjUnKSA9ICdudW1iZXInXG4gKiBnZXRUeXBlKDEwLjUpID0gJ251bWJlcidcbiAqIGdldFR5cGUoJzEwJykgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoMTApID0gJ2ludGVnZXInXG4gKiBnZXRUeXBlKCd0cnVlJykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSh0cnVlKSA9ICdib29sZWFuJ1xuICogZ2V0VHlwZShudWxsKSA9ICdudWxsJ1xuICogZ2V0VHlwZSh7IH0pID0gJ29iamVjdCdcbiAqIGdldFR5cGUoW10pID0gJ2FycmF5J1xuICpcbiAqIGdldFR5cGUoJzEwLjUnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSgxMC41LCAnc3RyaWN0JykgPSAnbnVtYmVyJ1xuICogZ2V0VHlwZSgnMTAnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSgxMCwgJ3N0cmljdCcpID0gJ2ludGVnZXInXG4gKiBnZXRUeXBlKCd0cnVlJywgJ3N0cmljdCcpID0gJ3N0cmluZydcbiAqIGdldFR5cGUodHJ1ZSwgJ3N0cmljdCcpID0gJ2Jvb2xlYW4nXG4gKlxuICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7IFNjaGVtYVR5cGUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZSh2YWx1ZSwgc3RyaWN0OiBhbnkgPSBmYWxzZSkge1xuICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHsgcmV0dXJuICdudWxsJzsgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHsgcmV0dXJuICdhcnJheSc7IH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkgeyByZXR1cm4gJ29iamVjdCc7IH1cbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgJ3N0cmljdCcpKSB7IHJldHVybiAnYm9vbGVhbic7IH1cbiAgaWYgKGlzSW50ZWdlcih2YWx1ZSwgc3RyaWN0KSkgeyByZXR1cm4gJ2ludGVnZXInOyB9XG4gIGlmIChpc051bWJlcih2YWx1ZSwgc3RyaWN0KSkgeyByZXR1cm4gJ251bWJlcic7IH1cbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSB8fCAoIXN0cmljdCAmJiBpc0RhdGUodmFsdWUpKSkgeyByZXR1cm4gJ3N0cmluZyc7IH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogJ2lzVHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3Mgd2V0aGVyIGFuIGlucHV0IChwcm9iYWJseSBzdHJpbmcpIHZhbHVlIGNvbnRhaW5zIGRhdGEgb2ZcbiAqIGEgc3BlY2lmaWVkIEpTT04gU2NoZW1hIHR5cGVcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IFNjaGVtYVByaW1pdGl2ZVR5cGUgfSB0eXBlIC0gdHlwZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZSh2YWx1ZSwgdHlwZSkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIGlzU3RyaW5nKHZhbHVlKSB8fCBpc0RhdGUodmFsdWUpO1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNOdW1iZXIodmFsdWUpO1xuICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgcmV0dXJuIGlzSW50ZWdlcih2YWx1ZSk7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gaXNCb29sZWFuKHZhbHVlKTtcbiAgICBjYXNlICdudWxsJzpcbiAgICAgIHJldHVybiAhaGFzVmFsdWUodmFsdWUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKGBpc1R5cGUgZXJyb3I6IFwiJHt0eXBlfVwiIGlzIG5vdCBhIHJlY29nbml6ZWQgdHlwZS5gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogJ2lzUHJpbWl0aXZlJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyB3ZXRoZXIgYW4gaW5wdXQgdmFsdWUgaXMgYSBKYXZhU2NyaXB0IHByaW1pdGl2ZSB0eXBlOlxuICogc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIG9yIG51bGwuXG4gKlxuICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUodmFsdWUpIHtcbiAgcmV0dXJuIChpc1N0cmluZyh2YWx1ZSkgfHwgaXNOdW1iZXIodmFsdWUpIHx8XG4gICAgaXNCb29sZWFuKHZhbHVlLCAnc3RyaWN0JykgfHwgdmFsdWUgPT09IG51bGwpO1xufVxuXG4vKipcbiAqICd0b0phdmFTY3JpcHRUeXBlJyBmdW5jdGlvblxuICpcbiAqIENvbnZlcnRzIGFuIGlucHV0IChwcm9iYWJseSBzdHJpbmcpIHZhbHVlIHRvIGEgSmF2YVNjcmlwdCBwcmltaXRpdmUgdHlwZSAtXG4gKiAnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJywgb3IgJ251bGwnIC0gYmVmb3JlIHN0b3JpbmcgaW4gYSBKU09OIG9iamVjdC5cbiAqXG4gKiBEb2VzIG5vdCBjb2VyY2UgdmFsdWVzIChvdGhlciB0aGFuIG51bGwpLCBhbmQgb25seSBjb252ZXJ0cyB0aGUgdHlwZXNcbiAqIG9mIHZhbHVlcyB0aGF0IHdvdWxkIG90aGVyd2lzZSBiZSB2YWxpZC5cbiAqXG4gKiBJZiB0aGUgb3B0aW9uYWwgdGhpcmQgcGFyYW1ldGVyICdzdHJpY3RJbnRlZ2VycycgaXMgVFJVRSwgYW5kIHRoZVxuICogSlNPTiBTY2hlbWEgdHlwZSAnaW50ZWdlcicgaXMgc3BlY2lmaWVkLCBpdCBhbHNvIHZlcmlmaWVzIHRoZSBpbnB1dCB2YWx1ZVxuICogaXMgYW4gaW50ZWdlciBhbmQsIGlmIGl0IGlzLCByZXR1cm5zIGl0IGFzIGEgSmF2ZVNjcmlwdCBudW1iZXIuXG4gKiBJZiAnc3RyaWN0SW50ZWdlcnMnIGlzIEZBTFNFIChvciBub3Qgc2V0KSB0aGUgdHlwZSAnaW50ZWdlcicgaXMgdHJlYXRlZFxuICogZXhhY3RseSB0aGUgc2FtZSBhcyAnbnVtYmVyJywgYW5kIGFsbG93cyBkZWNpbWFscy5cbiAqXG4gKiBWYWxpZCBFeGFtcGxlczpcbiAqIHRvSmF2YVNjcmlwdFR5cGUoJzEwJywgICAnbnVtYmVyJyApID0gMTAgICAvLyAnMTAnICAgaXMgYSBudW1iZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoJzEwJywgICAnaW50ZWdlcicpID0gMTAgICAvLyAnMTAnICAgaXMgYWxzbyBhbiBpbnRlZ2VyXG4gKiB0b0phdmFTY3JpcHRUeXBlKCAxMCwgICAgJ2ludGVnZXInKSA9IDEwICAgLy8gIDEwICAgIGlzIHN0aWxsIGFuIGludGVnZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoIDEwLCAgICAnc3RyaW5nJyApID0gJzEwJyAvLyAgMTAgICAgY2FuIGJlIG1hZGUgaW50byBhIHN0cmluZ1xuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAuNScsICdudW1iZXInICkgPSAxMC41IC8vICcxMC41JyBpcyBhIG51bWJlclxuICpcbiAqIEludmFsaWQgRXhhbXBsZXM6XG4gKiB0b0phdmFTY3JpcHRUeXBlKCcxMC41JywgJ2ludGVnZXInKSA9IG51bGwgLy8gJzEwLjUnIGlzIG5vdCBhbiBpbnRlZ2VyXG4gKiB0b0phdmFTY3JpcHRUeXBlKCAxMC41LCAgJ2ludGVnZXInKSA9IG51bGwgLy8gIDEwLjUgIGlzIHN0aWxsIG5vdCBhbiBpbnRlZ2VyXG4gKlxuICogLy8gIHsgUHJpbWl0aXZlVmFsdWUgfSB2YWx1ZSAtIHZhbHVlIHRvIGNvbnZlcnRcbiAqIC8vICB7IFNjaGVtYVByaW1pdGl2ZVR5cGUgfCBTY2hlbWFQcmltaXRpdmVUeXBlW10gfSB0eXBlcyAtIHR5cGVzIHRvIGNvbnZlcnQgdG9cbiAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IHN0cmljdEludGVnZXJzIC0gaWYgRkFMU0UsIHRyZWF0IGludGVnZXJzIGFzIG51bWJlcnNcbiAqIC8vIHsgUHJpbWl0aXZlVmFsdWUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgdHlwZXMsIHN0cmljdEludGVnZXJzID0gdHJ1ZSkgIHtcbiAgaWYgKCFpc0RlZmluZWQodmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gIGlmIChpc1N0cmluZyh0eXBlcykpIHsgdHlwZXMgPSBbdHlwZXNdOyB9XG4gIGlmIChzdHJpY3RJbnRlZ2VycyAmJiBpbkFycmF5KCdpbnRlZ2VyJywgdHlwZXMpKSB7XG4gICAgaWYgKGlzSW50ZWdlcih2YWx1ZSwgJ3N0cmljdCcpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIGlmIChpc0ludGVnZXIodmFsdWUpKSB7IHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApOyB9XG4gIH1cbiAgaWYgKGluQXJyYXkoJ251bWJlcicsIHR5cGVzKSB8fCAoIXN0cmljdEludGVnZXJzICYmIGluQXJyYXkoJ2ludGVnZXInLCB0eXBlcykpKSB7XG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlLCAnc3RyaWN0JykpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlKSkgeyByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7IH1cbiAgfVxuICBpZiAoaW5BcnJheSgnc3RyaW5nJywgdHlwZXMpKSB7XG4gICAgaWYgKGlzU3RyaW5nKHZhbHVlKSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAvLyBJZiB2YWx1ZSBpcyBhIGRhdGUsIGFuZCB0eXBlcyBpbmNsdWRlcyAnc3RyaW5nJyxcbiAgICAvLyBjb252ZXJ0IHRoZSBkYXRlIHRvIGEgc3RyaW5nXG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHsgcmV0dXJuIHZhbHVlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApOyB9XG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlKSkgeyByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTsgfVxuICB9XG4gIC8vIElmIHZhbHVlIGlzIGEgZGF0ZSwgYW5kIHR5cGVzIGluY2x1ZGVzICdpbnRlZ2VyJyBvciAnbnVtYmVyJyxcbiAgLy8gYnV0IG5vdCAnc3RyaW5nJywgY29udmVydCB0aGUgZGF0ZSB0byBhIG51bWJlclxuICBpZiAoaXNEYXRlKHZhbHVlKSAmJiAoaW5BcnJheSgnaW50ZWdlcicsIHR5cGVzKSB8fCBpbkFycmF5KCdudW1iZXInLCB0eXBlcykpKSB7XG4gICAgcmV0dXJuIHZhbHVlLmdldFRpbWUoKTtcbiAgfVxuICBpZiAoaW5BcnJheSgnYm9vbGVhbicsIHR5cGVzKSkge1xuICAgIGlmIChpc0Jvb2xlYW4odmFsdWUsIHRydWUpKSB7IHJldHVybiB0cnVlOyB9XG4gICAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgZmFsc2UpKSB7IHJldHVybiBmYWxzZTsgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqICd0b1NjaGVtYVR5cGUnIGZ1bmN0aW9uXG4gKlxuICogQ29udmVydHMgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgdG8gdGhlIFwiYmVzdFwiIEphdmFTY3JpcHRcbiAqIGVxdWl2YWxlbnQgYXZhaWxhYmxlIGZyb20gYW4gYWxsb3dlZCBsaXN0IG9mIEpTT04gU2NoZW1hIHR5cGVzLCB3aGljaCBtYXlcbiAqIGNvbnRhaW4gJ3N0cmluZycsICdudW1iZXInLCAnaW50ZWdlcicsICdib29sZWFuJywgYW5kL29yICdudWxsJy5cbiAqIElmIG5lY3NzYXJ5LCBpdCBkb2VzIHByb2dyZXNzaXZlbHkgYWdyZXNzaXZlIHR5cGUgY29lcnNpb24uXG4gKiBJdCB3aWxsIG5vdCByZXR1cm4gbnVsbCB1bmxlc3MgbnVsbCBpcyBpbiB0aGUgbGlzdCBvZiBhbGxvd2VkIHR5cGVzLlxuICpcbiAqIE51bWJlciBjb252ZXJzaW9uIGV4YW1wbGVzOlxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnbnVtYmVyJywnaW50ZWdlcicsJ3N0cmluZyddKSA9IDEwIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMTAnLCBbJ251bWJlcicsJ3N0cmluZyddKSA9IDEwIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnc3RyaW5nJ10pID0gJzEwJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnbnVtYmVyJywnaW50ZWdlcicsJ3N0cmluZyddKSA9IDEwLjUgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEwLjUnLCBbJ2ludGVnZXInLCdzdHJpbmcnXSkgPSAnMTAuNScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEwLjUnLCBbJ2ludGVnZXInXSkgPSAxMCAvLyBpbnRlZ2VyXG4gKiB0b1NjaGVtYVR5cGUoMTAuNSwgWydudWxsJywnYm9vbGVhbicsJ3N0cmluZyddKSA9ICcxMC41JyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgxMC41LCBbJ251bGwnLCdib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKlxuICogU3RyaW5nIGNvbnZlcnNpb24gZXhhbXBsZXM6XG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gJzEuNXgnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCcxLjV4JywgWydib29sZWFuJywnbnVtYmVyJywnaW50ZWdlciddKSA9ICcxLjUnIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKCcxLjV4JywgWydib29sZWFuJywnaW50ZWdlciddKSA9ICcxJyAvLyBpbnRlZ2VyXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgneHl6JywgWydudW1iZXInLCdpbnRlZ2VyJywnYm9vbGVhbicsJ251bGwnXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgneHl6JywgWydudW1iZXInLCdpbnRlZ2VyJywnbnVsbCddKSA9IG51bGwgLy8gbnVsbFxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInXSkgPSAwIC8vIG51bWJlclxuICpcbiAqIEJvb2xlYW4gY29udmVyc2lvbiBleGFtcGxlczpcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnaW50ZWdlcicsJ251bWJlcicsJ3N0cmluZycsJ2Jvb2xlYW4nXSkgPSAxIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IDEgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEnLCBbJ3N0cmluZycsJ2Jvb2xlYW4nXSkgPSAnMScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEnLCBbJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgndHJ1ZScsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9ICd0cnVlJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgndHJ1ZScsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydudW1iZXInXSkgPSAwIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJywnc3RyaW5nJ10pID0gJ3RydWUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJ10pID0gMSAvLyBudW1iZXJcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY29udmVydFxuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSB9IHR5cGVzIC0gYWxsb3dlZCB0eXBlcyB0byBjb252ZXJ0IHRvXG4gKiAvLyB7IFByaW1pdGl2ZVZhbHVlIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU2NoZW1hVHlwZSh2YWx1ZSwgdHlwZXMpIHtcbiAgaWYgKCFpc0FycmF5KDxTY2hlbWFQcmltaXRpdmVUeXBlPnR5cGVzKSkge1xuICAgIHR5cGVzID0gPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT5bdHlwZXNdO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bGwnKSAmJiAhaGFzVmFsdWUodmFsdWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnYm9vbGVhbicpICYmICFpc0Jvb2xlYW4odmFsdWUsICdzdHJpY3QnKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpIHtcbiAgICBjb25zdCB0ZXN0VmFsdWUgPSB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnaW50ZWdlcicpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuICt0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSkge1xuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdudW1iZXInKTtcbiAgICBpZiAodGVzdFZhbHVlICE9PSBudWxsKSB7IHJldHVybiArdGVzdFZhbHVlOyB9XG4gIH1cbiAgaWYgKFxuICAgIChpc1N0cmluZyh2YWx1ZSkgfHwgaXNOdW1iZXIodmFsdWUsICdzdHJpY3QnKSkgJiZcbiAgICAoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ3N0cmluZycpXG4gICkgeyAvLyBDb252ZXJ0IG51bWJlciB0byBzdHJpbmdcbiAgICByZXR1cm4gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2Jvb2xlYW4nKSAmJiBpc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgcmV0dXJuIHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdib29sZWFuJyk7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnc3RyaW5nJykpIHsgLy8gQ29udmVydCBudWxsICYgYm9vbGVhbiB0byBzdHJpbmdcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHsgcmV0dXJuICcnOyB9XG4gICAgY29uc3QgdGVzdFZhbHVlID0gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ3N0cmluZycpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoXG4gICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSB8fFxuICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnaW50ZWdlcicpKVxuICApIHtcbiAgICBpZiAodmFsdWUgPT09IHRydWUpIHsgcmV0dXJuIDE7IH0gLy8gQ29udmVydCBib29sZWFuICYgbnVsbCB0byBudW1iZXJcbiAgICBpZiAodmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgeyByZXR1cm4gMDsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpKSB7IC8vIENvbnZlcnQgbWl4ZWQgc3RyaW5nIHRvIG51bWJlclxuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHBhcnNlRmxvYXQoPHN0cmluZz52YWx1ZSk7XG4gICAgaWYgKCEhdGVzdFZhbHVlKSB7IHJldHVybiB0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpIHsgLy8gQ29udmVydCBzdHJpbmcgb3IgbnVtYmVyIHRvIGludGVnZXJcbiAgICBjb25zdCB0ZXN0VmFsdWUgPSBwYXJzZUludCg8c3RyaW5nPnZhbHVlLCAxMCk7XG4gICAgaWYgKCEhdGVzdFZhbHVlKSB7IHJldHVybiB0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdib29sZWFuJykpIHsgLy8gQ29udmVydCBhbnl0aGluZyB0byBib29sZWFuXG4gICAgcmV0dXJuICEhdmFsdWU7XG4gIH1cbiAgaWYgKChcbiAgICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVtYmVyJykgfHxcbiAgICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnaW50ZWdlcicpXG4gICAgKSAmJiAhKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudWxsJylcbiAgKSB7XG4gICAgcmV0dXJuIDA7IC8vIElmIG51bGwgbm90IGFsbG93ZWQsIHJldHVybiAwIGZvciBub24tY29udmVydGFibGUgdmFsdWVzXG4gIH1cbn1cblxuLyoqXG4gKiAnaXNQcm9taXNlJyBmdW5jdGlvblxuICpcbiAqIC8vICAgb2JqZWN0XG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCk6IG9iamVjdCBpcyBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gISFvYmplY3QgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqICdpc09ic2VydmFibGUnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBvYmplY3RcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09ic2VydmFibGUob2JqZWN0KTogb2JqZWN0IGlzIE9ic2VydmFibGU8YW55PiB7XG4gIHJldHVybiAhIW9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiAnX3RvUHJvbWlzZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgeyBvYmplY3QgfSBvYmplY3RcbiAqIC8vIHsgUHJvbWlzZTxhbnk+IH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF90b1Byb21pc2Uob2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpID8gb2JqZWN0IDogb2JqZWN0LnRvUHJvbWlzZSgpO1xufVxuXG4vKipcbiAqICd0b09ic2VydmFibGUnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0XG4gKiAvLyB7IE9ic2VydmFibGU8YW55PiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b09ic2VydmFibGUob2JqZWN0KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgY29uc3Qgb2JzZXJ2YWJsZSA9IGlzUHJvbWlzZShvYmplY3QpID8gZnJvbShvYmplY3QpIDogb2JqZWN0O1xuICBpZiAoaXNPYnNlcnZhYmxlKG9ic2VydmFibGUpKSB7IHJldHVybiBvYnNlcnZhYmxlOyB9XG4gIGNvbnNvbGUuZXJyb3IoJ3RvT2JzZXJ2YWJsZSBlcnJvcjogRXhwZWN0ZWQgdmFsaWRhdG9yIHRvIHJldHVybiBQcm9taXNlIG9yIE9ic2VydmFibGUuJyk7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgpO1xufVxuXG4vKipcbiAqICdpbkFycmF5JyBmdW5jdGlvblxuICpcbiAqIFNlYXJjaGVzIGFuIGFycmF5IGZvciBhbiBpdGVtLCBvciBvbmUgb2YgYSBsaXN0IG9mIGl0ZW1zLCBhbmQgcmV0dXJucyB0cnVlXG4gKiBhcyBzb29uIGFzIGEgbWF0Y2ggaXMgZm91bmQsIG9yIGZhbHNlIGlmIG5vIG1hdGNoLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgYWxsSW4gaXMgc2V0IHRvIFRSVUUsIGFuZCB0aGUgaXRlbSB0byBmaW5kXG4gKiBpcyBhbiBhcnJheSwgdGhlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIG9ubHkgaWYgYWxsIGVsZW1lbnRzIGZyb20gaXRlbVxuICogYXJlIGZvdW5kIGluIHRoZSBhcnJheSBsaXN0LCBhbmQgZmFsc2UgaWYgYW55IGVsZW1lbnQgaXMgbm90IGZvdW5kLiBJZiB0aGVcbiAqIGl0ZW0gdG8gZmluZCBpcyBub3QgYW4gYXJyYXksIHNldHRpbmcgYWxsSW4gdG8gVFJVRSBoYXMgbm8gZWZmZWN0LlxuICpcbiAqIC8vICB7IGFueXxhbnlbXSB9IGl0ZW0gLSB0aGUgaXRlbSB0byBzZWFyY2ggZm9yXG4gKiAvLyAgIGFycmF5IC0gdGhlIGFycmF5IHRvIHNlYXJjaFxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gYWxsSW4gLSBpZiBUUlVFLCBhbGwgaXRlbXMgbXVzdCBiZSBpbiBhcnJheVxuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIGl0ZW0ocykgaW4gYXJyYXksIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5BcnJheShpdGVtLCBhcnJheSwgYWxsSW4gPSBmYWxzZSkge1xuICBpZiAoIWlzRGVmaW5lZChpdGVtKSB8fCAhaXNBcnJheShhcnJheSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHJldHVybiBpc0FycmF5KGl0ZW0pID9cbiAgICBpdGVtW2FsbEluID8gJ2V2ZXJ5JyA6ICdzb21lJ10oc3ViSXRlbSA9PiBhcnJheS5pbmNsdWRlcyhzdWJJdGVtKSkgOlxuICAgIGFycmF5LmluY2x1ZGVzKGl0ZW0pO1xufVxuXG4vKipcbiAqICd4b3InIHV0aWxpdHkgZnVuY3Rpb24gLSBleGNsdXNpdmUgb3JcbiAqXG4gKiBSZXR1cm5zIHRydWUgaWYgZXhhY3RseSBvbmUgb2YgdHdvIHZhbHVlcyBpcyB0cnV0aHkuXG4gKlxuICogLy8gICB2YWx1ZTEgLSBmaXJzdCB2YWx1ZSB0byBjaGVja1xuICogLy8gICB2YWx1ZTIgLSBzZWNvbmQgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBleGFjdGx5IG9uZSBpbnB1dCB2YWx1ZSBpcyB0cnV0aHksIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24geG9yKHZhbHVlMSwgdmFsdWUyKSB7XG4gIHJldHVybiAoISF2YWx1ZTEgJiYgIXZhbHVlMikgfHwgKCF2YWx1ZTEgJiYgISF2YWx1ZTIpO1xufVxuIl19