/**
 * Thing model events
 */

'use strict';

import {EventEmitter} from 'events';
import Thing from './thing.model';
import User from '../user/user.model';
import Map from '../map/map.model';
var ThingEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ThingEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Thing.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ThingEvents.emit(event + ':' + doc._id, doc);

    if(event =='save'){
    	makeMove(doc);
    }
    ThingEvents.emit(event, doc);
  }
}

function makeMove(moveParams){
	console.log(moveParams);
	var playerid = moveParams.playerid, 
	posSelect = moveParams.posSelect, 
	posEnd = moveParams.posEnd, 
	range = moveParams.range, 
	fillamount = moveParams.fillamount, 
	deltaX = moveParams.deltaX, 
	deltaY = moveParams.deltaY, 
	resX = moveParams.w, 
	resY = moveParams.h,
	size = moveParams.size,
	color = moveParams.color;
	

	//uaktualnij zmienne gracza w DB: mapdeltax, mapdeltay, size, range, fillamount, generalamount
	User.findOneAndUpdate({_id: playerid}, { $set: {mapdeltax: deltaX, mapdeltay: deltaY, size: size, range: range, fillamount: fillamount}}, {upsert: false}, function(err){});

	

	var gtX = posSelect.x-range/2,
	   ltX = posSelect.x+range/2,
	   gtY = posSelect.y-range/2,
	   ltY = posSelect.y+range/2;

	
	
	//W PRZYSZLOSCI ZMIENIC QUERY NA SZUKANIE ROWNIEZ PLAYERID W PLAYERS.PLAYERID, ZEBY POMINAC PETLE Z TMPLAYERS

	//!!!!!!!!!!!!TODO NOW!!!!!!!!!!!!!!!!!DODAC DO ZAYPTANIA POZYCJE WSKAZANEGO POLA!!!!!!!!!!!!!!

	

	Map.find({x: {$gt: gtX, $lt: ltX}, y: {$gt: gtY, $lt: ltY}}, function(err, cells){
		if(err){
			console.log(err);
		}

		//var sumOnSelectedCells = 0;
		var toClean = [];
		var sumOnSelectedCells = 0;
		for(var key in cells){
			//console.log(cells[key].players);
			//tabele z wspolrzednymi pol do wyczyszczenia z gracza

			var tmpPlayers = cells[key].players.toObject();
			if(tmpPlayers.length!=undefined){
				//console.log(tmpPlayers);
				
				for(var playerKey in tmpPlayers){
					//console.log(tmpPlayers[playerKey]);
					if(tmpPlayers[playerKey].playerid==playerid){
						//zsumuj jednostki
						//sumOnSelectedCells = sumOnSelectedCells + parseInt(tmpPlayers[playerKey].amount);

						//toClean.push({x: cells[key].x, y: cells[key].y});
						color = tmpPlayers[playerKey].color;
						var amountToMove = tmpPlayers[playerKey].amount;
						
						sumOnSelectedCells = sumOnSelectedCells + amountToMove;
						if(amountToMove!=undefined&&color!=undefined&&playerid!=undefined){
							var queryDel =  Map.findOneAndUpdate({ "x" : cells[key].x, "y" : cells[key].y}, {$pull : { "players" : { "playerid": playerid}}}, {upsert : false});
							var promiseDel = queryDel.exec(function(err){
								if(err){
									console.log(err);
								}
								//var querySpillMakeCell = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": {'amount': amountToMove, 'color': color, 'playerid': playerid}}},{safe: true, upsert: true, new : true});
								//var querySpillMakeCell = Map.findOne({"x": randX, "y": randY,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
								
							});
							console.log('czy koniec usuwani zaznaczonych komorek',playerKey, tmpPlayers.length);
							if(playerKey==tmpPlayers.length-1){

								var queryDelBeforeAdd =  Map.findOneAndUpdate({ "x" : posEnd.x, "y" : posEnd.y}, {$pull : { "players" : { "playerid": playerid}}}, {upsert : false});
								var promiseDelBeforeAdd = queryDelBeforeAdd.exec(function(err){
									if(err){
										console.log(err);
									}
									//console.log(posEnd.x, posEnd.y, playerid, sumOnSelectedCells, color);
									var playerOnCell = {
										playerid: playerid,
										color: color,
										amount: sumOnSelectedCells
									}
									console.log('RUCH', sumOnSelectedCells, amountToMove);
									var queryDelBeforeAdd =  Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": playerOnCell}},{safe: true, upsert: true});
									return queryDelBeforeAdd.exec(function(err){
										if(err){
											console.log(err);
										}
									});
									/*
									var promiseDelBeforeAdd = queryDelBeforeAdd.exec(function(err){
										if(err){
											console.log(err);
											//var queryAdd = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": {'amount': sumOnSelectedCells, 'color': color, 'playerid': playerid}}},{safe: true, upsert: true, new : true});
										}
									});
									*/
									
									//var queryAddAgain = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": {'amount': amountToMove, 'color': color, 'playerid': playerid}}},{safe: true, upsert: true, new : true});
									//var querySpillMakeCell = Map.findOne({"x": randX, "y": randY,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
									
								});
								/*
								var queryMoveMakeCell = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y, "players.playerid": playerid}, {$inc: {"players.$.amount" : sumOnSelectedCells}, $set: {"players.$.color": color}, $set: {"players.$.playerid": playerid}},{safe: true, upsert: true, new : true});
								var promiseMoveMakeCell = queryMoveMakeCell.exec(function(err){
									if(err){
										console.log('ERROOOOORRRRRR!!!!!!!!!');
										var queryMoveMakeAgainCell = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": {'amount': sumOnSelectedCells, 'color': color, 'playerid': playerid}}},{upsert: true, new: true, setDefaultsOnInsert: true });
										var promiseMoveMakeAgainCell = queryMoveMakeAgainCell.exec(function(err){
											if(err){
												console.log('NESTED ERROOOOORRRRRR!!!!!!!!!');
											}
											return;
										});
									}
									return;
								});

								*/
							}

							/*
							var queryAdd = Map.update({"x": posEnd.x, "y": posEnd.y ,"players.playerid": playerid}, {$set: {"players.$.amount" : sumOnSelectedCells}, $set: {"players.$.color": color}, $set: {"players.$.playerid": playerid}}, {upsert : true, new : true});
							var promiseAdd = queryAdd.exec(function(err){
								if(err){
									console.log(err);
									var querySpillMakeCell = Map.findOneAndUpdate({"x": posEnd.x, "y": posEnd.y}, {$push: {"players": {'amount': sumOnSelectedCells, 'color': color, 'playerid': playerid}}},{safe: true, upsert: true, new : true});
									//var querySpillMakeCell = Map.findOne({"x": randX, "y": randY,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
									var promiseSpillMakeCell = querySpillMakeCell.exec();
								}
							});
							*/
							
							//sumOnSelectedCells = 0;
						}
						//usun jednostki z danej komorki - pull po player id
						/*
						var queryDel = Map.findOneAndUpdate({ "x" : cells[key].x, "y" : cells[key].y}, {$pull : { "players" : { "playerid": playerid}}}, {upsert : true});
						var promiseDel = queryDel.exec(function (err) {
					      	console.log('queryDel done');
					      	var queryAdd = Map.findOneAndUpdate( { "x" : posEnd.x, "y" : posEnd.y}, { $push : { "players" : { "playerid" : playerid, "amount" : sumOnSelectedCells, "color": color}}}, {upsert : true});
							var promiseAdd = queryAdd.exec(function (err) {
						      console.log('queryAdd done');
						      sumOnSelectedCells = 0;
						    });
					    });
						*/
					}
					//console.log((parseInt(key)+1), parseInt(cells.length), parseInt(playerKey+1), parseInt(tmpPlayers.length));
					//console.log(parseInt(key+1)-parseInt(cells.length)+parseInt(playerKey+1)-parseInt(tmpPlayers.length));
					/*
					if(((parseInt(key)+1)==parseInt(cells.length))&&(parseInt(playerKey+1)==parseInt(tmpPlayers.length))){
						console.log(toClean, toClean.length);
						//przed dodaniem ilosci, sprawdz czy juz jakies jednostki byly na wskazanej komorce, jak tak: dodaj ilsoc do ilosci sumarycznej, usun jednostki ze wskazanej komorki, nastepnie przenies zsumowana ilsoc na wskazana komorke
						console.log('Koniec petli po wskazanych komorkach. SUMA:', sumOnSelectedCells);
						
					}
					*/
				}
			}

			
		}
	});
	//zapisz sumatyczna ilosc z wybranych komorek, wyczysc wybrane komorki z jendostek gracza
	//wyslij jednostki
	//jak ilsoc jednostek > fillamount, rozlej na pobliskie komorki

}

export default ThingEvents;
