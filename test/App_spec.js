/*global describe, beforeEach, afterEach, it*/
'use strict';

var _ = require('underscore'),
    sinon = require('sinon'),
    App = require('../lib/App');

describe('App', function () {
    var sandbox,
        fakeGhost;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            filters: {
                register: sandbox.stub(),
                unregister: sandbox.stub()
            }
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('has correct methods', function () {
        var app = new App(fakeGhost),
            methods = [
                'initialize',
                'install',
                'uninstall',
                'activate',
                'deactivate'
            ];

        _(methods).each(function (method) {
            _.isFunction(app[method]).should.equal(true);
        });
    });

    it('registers filters on activate', function (done) {
        var FilterApp = App.extend({
                filters: {
                    ghost_head: 'handleGhostHead',
                    ghost_foot: [9, 'handleGhostFoot'],
                    prePostRender: ['handlePrePostRender']
                },

                activate: function () {
                    // For testing this actually was run
                    this.otherThing = true;
                },

                handleGhostHead: sandbox.stub(),

                handleGhostFoot: sandbox.stub(),

                handlePrePostRender: sandbox.stub()
            }),
            app = new FilterApp(fakeGhost);

        app.activate().then(function () {
            app.otherThing.should.equal(true);

            fakeGhost.filters.register.calledWithExactly('ghost_head', null, app.handleGhostHead).should.equal(true);
            fakeGhost.filters.register.calledWithExactly('ghost_foot', 9, app.handleGhostFoot).should.equal(true);
            fakeGhost.filters.register.calledWithExactly('prePostRender', null, app.handlePrePostRender).should.equal(true);

            done();
        }, done);
    });
});