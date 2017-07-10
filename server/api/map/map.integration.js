'use strict';

var app = require('../..');
import request from 'supertest';

var newMap;

describe('Map API:', function() {

  describe('GET /api/maps', function() {
    var maps;

    beforeEach(function(done) {
      request(app)
        .get('/api/maps')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          maps = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      maps.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/maps', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/maps')
        .send({
          name: 'New Map',
          info: 'This is the brand new map!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newMap = res.body;
          done();
        });
    });

    it('should respond with the newly created map', function() {
      newMap.name.should.equal('New Map');
      newMap.info.should.equal('This is the brand new map!!!');
    });

  });

  describe('GET /api/maps/:id', function() {
    var map;

    beforeEach(function(done) {
      request(app)
        .get('/api/maps/' + newMap._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          map = res.body;
          done();
        });
    });

    afterEach(function() {
      map = {};
    });

    it('should respond with the requested map', function() {
      map.name.should.equal('New Map');
      map.info.should.equal('This is the brand new map!!!');
    });

  });

  describe('PUT /api/maps/:id', function() {
    var updatedMap;

    beforeEach(function(done) {
      request(app)
        .put('/api/maps/' + newMap._id)
        .send({
          name: 'Updated Map',
          info: 'This is the updated map!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedMap = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedMap = {};
    });

    it('should respond with the updated map', function() {
      updatedMap.name.should.equal('Updated Map');
      updatedMap.info.should.equal('This is the updated map!!!');
    });

  });

  describe('DELETE /api/maps/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/maps/' + newMap._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when map does not exist', function(done) {
      request(app)
        .delete('/api/maps/' + newMap._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
