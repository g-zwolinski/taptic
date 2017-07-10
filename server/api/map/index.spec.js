'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mapCtrlStub = {
  index: 'mapCtrl.index',
  show: 'mapCtrl.show',
  create: 'mapCtrl.create',
  update: 'mapCtrl.update',
  destroy: 'mapCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var mapIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './map.controller': mapCtrlStub
});

describe('Map API Router:', function() {

  it('should return an express router instance', function() {
    mapIndex.should.equal(routerStub);
  });

  describe('GET /api/maps', function() {

    it('should route to map.controller.index', function() {
      routerStub.get
        .withArgs('/', 'mapCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/maps/:id', function() {

    it('should route to map.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'mapCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/maps', function() {

    it('should route to map.controller.create', function() {
      routerStub.post
        .withArgs('/', 'mapCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/maps/:id', function() {

    it('should route to map.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'mapCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/maps/:id', function() {

    it('should route to map.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'mapCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/maps/:id', function() {

    it('should route to map.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'mapCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
