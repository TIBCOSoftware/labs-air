var should     = require('chai').should();
var echoServer = require('echo-server-with-api');
var syncRest   = require('../index.js');

describe('sync-rest-client', function() {

    this.timeout(10000);

    before(done => echoServer.start(done));
    after(done => echoServer.stop(done));

    it('http: get', () => {
        var response = syncRest.get(echoServer.location);
        response.body.method.should.equal('get');
        response.statusCode.should.equal(200);
        response.body.url.should.equal('/');
    });

    it('http: delete', () => {
        var response = syncRest.del(echoServer.location);
        response.body.method.should.equal('delete');
        response.statusCode.should.equal(200);
    });

    it('http: put', () => {
        var response = syncRest.put(echoServer.location, {payload: {foo:'bar'}});
        response.body.method.should.equal('put');
        response.statusCode.should.equal(200);
        response.body.body.foo.should.equal('bar');
    });

    it('http: post', () => {
        var response = syncRest.post(echoServer.location, {payload: {foo:'bar'}});
        response.body.method.should.equal('post');
        response.statusCode.should.equal(200);
        response.body.body.foo.should.equal('bar');
    });

    it('http: head', () => {
        var response = syncRest.head(echoServer.location);
        response.body.should.be.empty;
        response.statusCode.should.equal(200);
    });

    it('http: patch', () => {
        var response = syncRest.patch(echoServer.location, {payload: {foo:'bar'}});
        response.statusCode.should.equal(200);
        response.body.method.should.equal('patch');
        response.body.body.foo.should.equal('bar');
    });

    it('http: options', () => {
        var response = syncRest.options(echoServer.location);
        response.body.method.should.equal('options');
        response.statusCode.should.equal(200);
    });

    it('http: query-string', () => {
        var response = syncRest.get(echoServer.location + '/?foo=bar');
        response.statusCode.should.equal(200);
        response.body.query.foo.should.equal('bar');
    });

    it('http: custom headers (per request)', () => {
        var response = syncRest.get(echoServer.location, {headers: {'x-foo':'bar'}});
        response.statusCode.should.equal(200);
        response.body.headers['x-foo'].should.equal('bar');
    });

    it('http: custom headers (global)', () => {
        syncRest.addGlobalHeader('x-foo', 'bar');

        syncRest.addGlobalHeader('x-qwe', 'asd');
        syncRest.removeGlobalHeader('x-qwe');

        var response = syncRest.get(echoServer.location);
        response.statusCode.should.equal(200);
        response.body.headers['x-foo'].should.equal('bar');
        should.not.exist(response.body.headers['x-qwe']);

        syncRest.clearGlobalHeaders();
    });

    it('error-handling: timeout', () => {
        var response = syncRest.get(echoServer.location + '/?timeout', {timeout:0.5, retries:0});
        should.not.exist(response.statusCode);
        response.code.should.match(/timed?out/i);
    });

    it('error-handling: retry', () => {
        var response = syncRest.get(echoServer.location + '/?timeout', {timeout:0.5, retries:3});
        should.not.exist(response.statusCode);
        response.code.should.match(/timed?out/i);
        response.retriesCount.should.equal(3);
    });

    it('error-handling: retry interval', () => {
        var start    = new Date().getTime();
        var response = syncRest.get(echoServer.location + '/?timeout', {timeout:0.5, retries:3, interval:1});
        var time     = new Date().getTime() - start;

        time.should.be.above(3000); // 3 retries with a 1 second interval should take at least 3 seconds
        should.not.exist(response.statusCode);
        response.code.should.match(/timed?out/i);
        response.retriesCount.should.equal(3);
    });

    it('getGlobalHeaders()', () => {
        syncRest.addGlobalHeader('foo', 'bar');

        syncRest.getGlobalHeaders().should.be.an('object');
        syncRest.getGlobalHeaders().should.have.key('foo');

        syncRest.clearGlobalHeaders();
    });
});