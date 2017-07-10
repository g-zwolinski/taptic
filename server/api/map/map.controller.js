/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/maps              ->  index
 * POST    /api/maps              ->  create
 * GET     /api/maps/:id          ->  show
 * PUT     /api/maps/:id          ->  update
 * DELETE  /api/maps/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Map from './map.model';
import User from '../user/user.model';

function getCells(req, res){
  //console.log(res);
  return Map.find({'x': 0});
}

function processArray(items, process) {
    var todo = items.concat();
    setTimeout(function() {
        process(todo.shift());
        if(todo.length > 0) {
            setTimeout(arguments.callee, 25);
        }
    }, 25);
}

//processArray([many many elements], function () {lots of work to do});
     
function respondWithResult(res, statusCode) {
  //console.log(res.body);
  statusCode = statusCode || 200;    
  return function(entity) {
    if (entity) {
      //console.log(entity);
      return res.status(statusCode).json(entity);
    }
  };
}
/*
function modifyResults(res){
  if(res.body!=undefined){
    console.log(res.body);
    var tmpCells = {};
    for(var x = res.body.deltaX; x <= res.body.resX; x++){
      for(var y = res.body.deltaY; y <= res.body.resY; y++){
        console.log(x,y);
        Map.findOne({'x': x, 'y': y}, function(err, cell) {
          if (err) {
            console.log(err);
          }
          tmpCells.push(cell);
        });
      }
    }
    return function() {
        console.log(tmpCells);
    };
  }
  
  //next();
}
*/

/*
function getEntityAndMakeResultObject(res){
  return function(entity) {
    if (entity) {
      console.log(entity.deltaX, entity.deltaY, entity.resX, entity.resY);
      for(var x = entity.deltaX; x <= entity.resX; x++){
        for(var y = entity.deltaY; y <= entity.resY; y++){
          //console.log(x,y);
          Map.find({'x': x}, function(err, cells) {
            if (err) {
              console.log(err);
            }
            var cell = {};
            cells.forEach(function(cell) {
              if(cell.y==y){
                console.log(cell);
              }
            });
          });
        }
      }
    }
 
}
*/
function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Maps
export function index(req, res) {
  return Map.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Map from the DB
export function show(req, res) {
  return Map.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Map in the DB
export function create(req, res) {
  console.log(req.body.playerid);

  //User.findOneAndUpdate({_id: req.body.playerid}, { $set: {uptime: Date.now}}, {upsert: false}, function(err){});


  var gtX = req.body.deltaX-5,
   ltX = (req.body.deltaX*2)+req.body.resX,
   gtY = req.body.deltaY-5,
   ltY = (req.body.deltaY*2)+req.body.resY;
   //console.log(gtX, ltX, req.body.resX, req.body.deltaX);
  return Map.find({x: {$gt: gtX, $lt: ltX}, y: {$gt: gtY, $lt: ltY}})
  //.then(handleEntityNotFound(res))
  .then(respondWithResult(res, 201))
  .catch(handleError(res));
}

// Updates an existing Map in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Map.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Map from the DB
export function destroy(req, res) {
  return Map.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
