///////////////////////////////////////////////////////////
// sync-rest-client                                      //
///////////////////////////////////////////////////////////
// a very basic, synchronous rest\http client
// for the most part, this is just a synchronous wrapper
// on top of the well known "request" module
///////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////
// dependencies                                          //
///////////////////////////////////////////////////////////
var request  = require('request');
var deasync  = require('deasync');
var waitSync = require('wait-sync');
///////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////
// module globals                                        //
///////////////////////////////////////////////////////////
var $headers    = {};           // global headers
var $timeout    = 60;           // in seconds
var $interval   = 1;            // in seconds
var $maxRetries = 3;            // set to 0 to disable retries
var $currentTry = 0;
///////////////////////////////////////////////////////////





function send(method='get', path='/', options={}){
    var result        = null;
    var retryInterval = (options.interval || $interval);

    var requestOptions = {
        url     : path,
        method  : method,
        json    : typeof options.payload === 'object' ? options.payload : undefined,
        body    : typeof options.payload === 'string' ? options.payload : undefined,
        headers : Object.assign({}, options.headers, $headers),
        timeout : (options.timeout || $timeout) * 1000
    }

    // this module is synchronous, so we use 'deasync' to wait for the request to complete
    request(requestOptions, (err, res, body) => {
        result = err || res;
    });
    deasync.loopWhile(() => !result);

    // try to return JSON body if possible
    try      { result.body && (result.body = JSON.parse(result.body)) }
    catch(e) { /* body isn't a JSON... oh well */                      }


    ///////////////////////////////////////////////////////////
    // sync-retry mechanism                                  //
    ///////////////////////////////////////////////////////////
    // since this is a synchronous module, we use recursion
    // to provide "retries"
    //
    // we allow the user to set their own number of retries
    // for this request - or - we use the default $maxRetries
    //
    // we keep a count of the number of retries we ended up
    // doing so that we can add that information to the result
    //
    // after all the retry attempts have been exhausetd, we
    // reset the $maxRetries limit, as well as the $currentTry
    // counter (preparing for the "next" request, due to the
    // synchronous nature of this module)
    ///////////////////////////////////////////////////////////
    if (options.retries > -1){
        $maxRetries = options.retries;
    }

    if ($currentTry < $maxRetries && (!result.statusCode || result.statusCode >= 500)){
        $currentTry++;
        waitSync(retryInterval);
        result = send(method, path, options);
    }
    else { // no more (or zero) retries
        result.retriesCount = $currentTry;
        $currentTry         = 0;
        $maxRetries         = 3;
    }
    ///////////////////////////////////////////////////////////



    // finally, return the result of the sync request
    return result;
}




module.exports = {
    get     : send.bind(null, 'get'),
    del     : send.bind(null, 'delete'),
    put     : send.bind(null, 'put'),
    post    : send.bind(null, 'post'),
    head    : send.bind(null, 'head'),
    patch   : send.bind(null, 'patch'),
    options : send.bind(null, 'options'),

    setGlobalTimeout    : seconds       => $timeout    = seconds * 1000,
    setGlobalRetry      : numOfRetries  => $maxRetries = numOfRetries,
    setGlobalInterval   : seconds       => $interval   = seconds,

    clearGlobalHeaders  : ()            => $headers       = {},
    getGlobalHeaders    : ()            => Object.assign({}, $headers),
    addGlobalHeader     : (name, value) => $headers[name] = value,
    removeGlobalHeader  : name          => delete $headers[name]
};

