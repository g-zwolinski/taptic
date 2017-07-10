/**
 * Map model events
 */

'use strict';

import {EventEmitter} from 'events';
import Map from './map.model';
import User from '../user/user.model';
import mongoose from 'mongoose';

var MapEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
MapEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Map.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    MapEvents.emit(event + ':' + doc._id, doc);

/*
    if(event =='save'){
    	readReaquestForMap(doc);
    }
*/
    MapEvents.emit(event, doc);
  }
}
/*
function readReaquestForMap(requestParameters){
	var w = requestParameters.resX,
	h = requestParameters.resY,
	deltaX = requestParameters.deltaX,
	deltaY = requestParameters.deltaY;
	//res.send(["Hello world, this should be sent inmediately"]);
	//console.log(requestParameters);
}
*/

/*
function initialGrow(){
	if(isInitialGrowLoopDone){
		isInitialGrowLoopDone = false;
		User.find({}, function(err, users) {
			if (err) {
		        console.log(err);
		        isInitialGrowLoopDone = true;
		    }
		    var user = {};
		    users.forEach(function(user) {
		    	if(user.generalamount == 0){
		    		console.log('!!!!!!!!NEW PLAYER HAS BORN!!!!!!!!!');
		    		var query = Map.findOneAndUpdate( { "x" : 0, "y" : 0}, { $push : { "players" : { "playerid" : user._id, "amount" : 1, "color": user.color}}}, {upsert : true});
					var promise = query.exec();
		    		User.findOneAndUpdate({_id: user._id}, {generalamount: 1}, {upsert: true}, function(err){});
		    		console.log(user);
		    	}
		    });
		    isInitialGrowLoopDone = true;
		});

*/


		/*
		mongoose.connection.db.listCollections().toArray(function(err, names) {
		    if (err) {
		        console.log(err);
		        isGrowLoopDone = true;
		    }
		    else {
		        names.forEach(function(e,i,a) {
		            //mongoose.connection.db.dropCollection(e.name);
		            
		            if(e.name=="users"){
		            	console.log("--->>", e.name);
		            	isGrowLoopDone = true;
		            }
		        });
		    }
		});
		
	}
}
*/
//var isInitialGrowLoopDone = true;
//var intervalInitialGrow = setInterval(initialGrow, 1000);

var isGrowDone = true;
var startBattle = false;
var isBattleDone = true;
var startSpill = false;
var isSpillDone = true;

function checkFlags(){
	if(isGrowDone==true&&isBattleDone==true&&isSpillDone==true){
		isLoopDone = true;
	}
}

//var interval = setInterval(checkFlags, 1000);

var isLoopDone = true;
var interval = setInterval(gameLoop, 1000);


//amountToAdd = person.generalamount*growParameterFirst
var growParameter = 0;
var BattleParameter = 3/4;
var spillParameter = 1/10;

function gameLoop(){

	/*
	var promises = Array();
	for(var current in result) {
	   promise.push(list.update({ foreignId : current.Id }, current).exec()); 
	}
	return Promise.all(promises);
	*/
	console.log(isLoopDone);
	if(isLoopDone){
		//isLoopDone = false;
		//isGrowDone = false;
		//isBattleDone = false;
		//isSpillDone = false;

		var cells = {};
		//var promises = Array();
		
		Map.find({}, function(err, cells) {
			if (err) {
			   console.log(err);
			   isLoopDone = true;
			   //isGrowLoopDone = true;
			}
			var cellsIndexPrimary = 0;
			var cell = {};
			cells.forEach(function(cell) {
				cellsIndexPrimary++;
				//console.log(cell);
				var playerInCell = {};
				var playersInCell = cell.players;
				var playersFromUserCollection = {};

				var playersIndex = 0;
				var maxInCell = 0;


				
					playersInCell.forEach(function(playerInCell){
						playersIndex++;
						if(playerInCell.amount>maxInCell){maxInCell = playerInCell.amount};
						
						//ZNAJDZ UZYTKOWNIKA, W ODPOWIEDZI SPRAWDZ CZY MOZE UROSNAC
						//var query = User.findOneAndUpdate( {_id: playerInCell.playerid}, { $push : { "players" : { "playerid" : user._id, "amount" : 1, "color": user.color}}}, {upsert : true});
						//var promise = query.exec();
						//console.log(cell.x, cell.y, playerInCell.playerid, playerInCell.amount, playerInCell.color);
						User.findOne({_id: playerInCell.playerid}, function (err, person) {
							var nowDate   = new Date();
							var seconds = (nowDate.getTime() - person.lastgrow.getTime()) / 1000;
							//console.log('time:', seconds, 'amount: ', person.generalamount);
							//SPRAWDZ LASTGROW, JEZELI MINELO GENERALAMOUNT*SEKUNDA, TO DODAJ (GENERALAMOUNT/100 + 1)DO GENERALAMOUNT 
							if((seconds>person.generalamount)||playerInCell.amount<0){
								var amountToAdd = person.generalamount*growParameter + 1;
								if(amountToAdd<=0){
									amountToAdd=(person.generalamount*(-1))+1;
								}
								
								console.log('ABLE TO GROW!!!!!!!', amountToAdd, person.generalamount);
								person.lastgrow = nowDate;
								person.generalamount = person.generalamount + amountToAdd;
							  	person.save(function (err) {
							      if(err) {
							         console.error('ERROR!');
							      }
							   });
							   var queryGrow = Map.update({"x": cell.x, "y": cell.y ,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToAdd}}, {upsert : false});
								var promiseGrow = queryGrow.exec();
							}
							if(playersIndex==playersInCell.length){
								//console.log('w komorce jest ', playersIndex, 'najwieksza ilosc', maxInCell);

							}
						});

					});
				
				//koniec wzrostu przejdz do walki
				var playersBattleIndex = 0;
				//console.log('po wzroscie czas do walki', playersIndex, playersBattleIndex, 'najwieksza ilosc', maxInCell)
					var playerInCellBattle = {};
					if(playersInCell.length>1){
						playersInCell.forEach(function(playerInCellBattle){
							if((playerInCellBattle.amount<maxInCell)){
								var amountToDec = playerInCellBattle.amount*BattleParameter;
								User.findOne({_id: playerInCellBattle.playerid}, function (err, person) {
									console.log('ABLE TO TAKE DMG!!!!!!!', amountToDec, person.generalamount);
									person.generalamount = person.generalamount - amountToDec;
								  	person.save(function (err) {
								      if(err) {
								         console.error('ERROR!');
								      }
								   });
								   var queryBattle = Map.update({"x": cell.x, "y": cell.y ,"players.playerid": person._id}, {$inc: {"players.$.amount" : -amountToDec}}, {upsert : false});
									var promiseBattle = queryBattle.exec();
									if(playersBattleIndex==playersInCell.length){
										//console.log('koniec walki');

									}
								});
							}
						});
					}
				
				//koniec walki przejdz do rozlewania
				var playersSpillIndex = 0;
				var playerInCellSpill = {};
				//console.log('po wzroscie czas do rozlewania', playersIndex, playersBattleIndex, playersSpillIndex, 'najwieksza ilosc');
				//jak playerincell.amount > person.fillamount, wylosuj pobliska komorke

					playersInCell.forEach(function(playerInCellSpill){
						playersSpillIndex++;
						User.findOne({_id: playerInCellSpill.playerid}, function (err, person) {
							console.log('is able to spill?: ', playerInCellSpill.amount,person.fillamount, person.generalamount);
							var nowDate   = new Date();
							var secondsSpill = (nowDate.getTime() - person.uptime.getTime()) / 1000;
							//console.log('time:', secondsSpill, 'amount: ', person.generalamount);
							//SPRAWDZ LASTGROW, JEZELI MINELO GENERALAMOUNT*SEKUNDA, TO DODAJ (GENERALAMOUNT/100 + 1)DO GENERALAMOUNT 
							if((secondsSpill>person.generalamount*spillParameter)&&(parseInt(playerInCellSpill.amount)*8>parseInt(person.fillamount))&&(person.generalamount>0)){
								var amountToSpill = parseInt(playerInCellSpill.amount)-parseInt(person.fillamount);
								
								var randX = cell.x+Math.floor((Math.random() * 3))-1;
								var randY = cell.y+Math.floor((Math.random() * 3))-1;

								if(randX!=cell.x&&randY!=cell.y&&randX>=0&&randY>=0){
									console.log('ABLE TO SPILL!!!!!!!', amountToSpill, playerInCellSpill.amount, person.fillamount);
									//INC//
									//SET//var querySpillAdd = Map.update({"x": randX, "y": randY,"players.playerid": person._id}, {$set: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
									var querySpillAdd = Map.update({"x": randX, "y": randY,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
									
									
									var promiseSpillAdd = querySpillAdd.exec(function(err){
										if(err){
											console.log(err);
											if(amountToSpill!=undefined&&person.color!=undefined&&person._id!=undefined){
												console.log();
												var querySpillMakeCell = Map.findOneAndUpdate({"x": randX, "y": randY}, {$push: {"players": {'amount': amountToSpill, 'color': person.color, 'playerid': person._id}}},{safe: true, upsert: true, new : true});
												//var querySpillMakeCell = Map.findOne({"x": randX, "y": randY,"players.playerid": person._id}, {$inc: {"players.$.amount" : amountToSpill}, $set: {"players.$.color": person.color}, $set: {"players.$.playerid": person._id}}, {upsert : true});
												var promiseSpillMakeCell = querySpillMakeCell.exec();
											}
										}
									});
									if(amountToSpill!=undefined&&person.color!=undefined&&person._id!=undefined){
										var querySpillDec = Map.update({"x": cell.x, "y": cell.y ,"players.playerid": person._id}, {$inc: {"players.$.amount" : -amountToSpill}}, {upsert : false});
										var promiseSpillDec = querySpillDec.exec();
									}
									
								}
								person.uptime = nowDate;
							  	person.save(function (err) {
							      if(err) {
							         console.error('ERROR!');
							      }
							   });
							}
							if(playersSpillIndex==playersInCell.length){
								console.log('koniec rozlewania');

							}
						});
					});
				
			});
		});
	}
}

//DODAC INTERVAL Z FUNKCJA ROZLEWAJACA!!
function grow(){
	if(isGrowLoopDone){
		isGrowLoopDone = false;
		var cells = {};
		Map.find({}, function(err, cells) {
			if (err) {
		        console.log(err);
		        isGrowLoopDone = true;
		    }
		    var cell = {};
		    cells.forEach(function(cell) {
		    	//console.log('GROW', cell);

		    	var player = {};
		    	var person = {};
		    	//SPRAWDZ CZY JEST WIECEJ NIZ JEDEN GRACZ W KOMORCE, JAK TAK, TO SPRAWDZ KTOREGO JEST NAJWIECEJ, POZOSTALYM ILOSC = ILOSC/10

		    	//SPRAWDZ CZY MOZE UROSNAC
		    	cell.players.forEach(function(player) {
		    		//console.log('GROW player MAP', player, 'XY: ', cell.x, cell.y, 'AMOUNT: ', player.amount);
		    		User.findOne({ '_id': player.playerid }, function (err, person) {
					  if (err) return handleError(err);
					  //console.log('GROW player USER', person._id, person);
					  var nowDate   = new Date();
					  var seconds = (nowDate.getTime() - person.lastgrow.getTime()) / 1000;
					  //console.log(seconds,person.generalamount, "");
					  //SPRAWDZ LASTGROW, JEZELI MINELO GENERALAMOUNT*SEKUNDA, TO DODAJ (GENERALAMOUNT/100 + 1)DO GENERALAMOUNT 
					  if(seconds>person.generalamount){
					  	var amountToAdd = ~~ 1 + (person.generalamount/2)
					  	//console.log('DETECT GROWABLE IN', cell.x, cell.y, 'amountToAdd:', amountToAdd);
					  	//uaktualnij zmienne gracza w DB (User collection, Map collection)
					  	var tmpGeneralAmuont = person.generalamount+parseInt(amountToAdd);
					  	var tmpCellAmuont = parseInt(player.amount)+parseInt(amountToAdd);
					  	//console.log('GENERANL: ', tmpGeneralAmuont,'CELL: ', tmpCellAmuont);

					  	User.findOneAndUpdate({_id: person._id}, { $set: {lastgrow: Date.now}, $set: {generalamount: tmpGeneralAmuont}}, {upsert: false}, function(err){});
						//User.update({_id: person._id}, {}, {upsert: true}, function(err){});
						
						
						var queryDel = Map.findOneAndUpdate({ "x" : cell.x, "y" : cell.y}, {$pull : { "players" : { "playerid": person._id}}}, {upsert : true});
						var promiseDel = queryDel.exec(function (err) {
					      //console.log('queryDel done',cell.x, cell.y, person._id, player.amount,  parseInt(parseInt(player.amount)+parseInt(amountToAdd)));
					      var queryAdd = Map.findOneAndUpdate( { "x" : cell.x, "y" : cell.y}, { $push : { "players" : { "playerid" : person._id, "amount" : tmpCellAmuont, "color": person.color}}}, {upsert : true});
							return queryAdd.exec(function (err) {
						      //console.log('queryAdd done',cell.x, cell.y, person._id, player.amount, amountToAdd, person.generalamount);
						   	return;
						   });
						   
					    });
					  }

					  if(seconds<person.generalamount&&player.amount>person.fillamount){

		    				
		    				Map.find({x: {$gt: cell.x-2, $lt: cell.x+2}, y: {$gt: cell.y-2, $lt: cell.y+2}}, function (err, cellsToCheck) {
			    				if(err){
			    					console.log(err);
			    				}console.log();

			    				var iloscDoRozdania = player.amount-person.fillamount/cellsToCheck.length;
			    				console.log('SPRAWDZ[', cell.x-1,':', cell.x+1, '][',cell.y-1, ':', cell.y+1, ']','\n','SPRAWDZ nastepujace komorki[',cellsToCheck.length,']: ');//, cellsToCheck);
			    				
		    					/*
			    				Map.update( {x : cell.x, y: cell.y , "players.playerid" : person._id } , 
				                {$set : {"players.$.amount" : person.fillamount}}, {upsert : true});	
								*/
								var queryDelCheckedCell = Map.findOneAndUpdate({ "x" : cell.x, "y" : cell.y}, {$pull : { "players" : { "playerid": person._id}}}, {upsert : true});
								var promiseDelCheckedCell = queryDelCheckedCell.exec(function (err) {
							      //console.log('queryDel done',cell.x, cell.y, person._id, player.amount,  parseInt(parseInt(player.amount)+parseInt(amountToAdd)));
							      var queryAddCheckedCell = Map.findOneAndUpdate( { "x" : cell.x, "y" : cell.y}, { $push : { "players" : { "playerid" : person._id, "amount" : person.fillamount, "color": person.color}}}, {upsert : true});
									return queryAddCheckedCell.exec(function (err) {
										return;
								      //console.log('queryAdd done',cell.x, cell.y, person._id, player.amount, amountToAdd, person.generalamount);
								   });

							    });
				
			    				var tmpCell = {};
			    				for(var key in cellsToCheck) {
			    					if(cellsToCheck[key].x!=cell.x&&cellsToCheck[key].y!=cell.y){
			    						console.log(cellsToCheck[key].x, cellsToCheck[key].y);
			    						var queryDelCloseCell = Map.findOneAndUpdate({ "x" : cellsToCheck[key].x, "y" : cellsToCheck[key].y}, {$pull : { "players" : { "playerid": person._id}}}, {upsert : true});
										var promiseDelCloseCell = queryDelCloseCell.exec(function (err) {
									      //console.log('queryDel done',cell.x, cell.y, person._id, player.amount,  parseInt(parseInt(player.amount)+parseInt(amountToAdd)));
									      var queryAddCloseCell = Map.findOneAndUpdate( { "x" : cellsToCheck[key].x, "y" : cellsToCheck[key].y}, { $push : { "players" : { "playerid" : person._id, "amount" : iloscDoRozdania, "color": person.color}}}, {upsert : true});
											return queryAddCloseCell.exec(function (err) {
										      //console.log('queryAdd done',cell.x, cell.y, person._id, player.amount, amountToAdd, person.generalamount);
										   	return;
										   });
										   
									    });
			    						/*
			    						Map.update( {x : cellsToCheck[key].x, y: cellsToCheck[key].y, "players.playerid" : person._id} , 
				                	{$set : {"players.$.amount" : person.iloscDoRozdania}, $set : {"players.$.color" : person.color}, $set : {"players.$.playerid" : person._id}}, {upsert : true});	
			    						*/
			    					}	
			    				}


			    			});						
		    			}
					  
					});	
		    	});
		    	/*
		    	var queryDel = Map.update({ "x" : cells[key].x, "y" : cells[key].y}, {$pull : { "players" : { "playerid": playerid}}}, {upsert : true});
				var promiseDel = queryDel.exec(function (err) {
			    	console.log('queryDel done');
			    	var queryAdd = Map.update( { "x" : posEnd.x, "y" : posEnd.y}, { $push : { "players" : { "playerid" : playerid, "amount" : sumOnSelectedCells, "color": color}}}, {upsert : true});
					var promiseAdd = queryAdd.exec(function (err) {
				      console.log('queryAdd done');
				      sumOnSelectedCells = 0;
				    });
				});
				*/
		    });
		    isGrowLoopDone = true;
		});

	}
}


function rozlej(){
	if(isRozlane){
		console.log('rozlewanie');
		isRozlane = false;
		Map.find({}, function(err, cells) {
			if (err) {
		        console.log(err);
		        isRozlane = true;
		    }
		    var cell = {};
		    cells.forEach(function(cell) {
		    	//console.log('rozlej', cell);

		    	var player = {};
		    	var person = {};
		    	//player - dne z komorki, person - dane z user collection
		    	//sprawdz czy amount > fillamount, jak tak, przenies roznice gdzie indziej
		    	cell.players.forEach(function(player) {
		    		
		    		User.findOne({ '_id': player.playerid }, function (err, person) {
		    			if(err){
		    				console.log(err);
		    			}
		    			if(player.amount>person.fillamount){

		    				console.log('SPRAWDZ', cell.x-1, cell.x+1);
		    				Map.find({x: {$gt: cell.x-1, $lt: cell.x+1}, y: {$gt: cell.y-1, $lt: cell.y+1}}, function (err, cellsToCheck) {
			    				if(err){
			    					console.log(err);
			    				}

			    				console.log('SPRAWDZ CZY MOZNA ROZLAC', cellsToCheck);
			    			});
							



		    				/*
		    				for(var deltax = -1; deltax <= 1; deltax++){
		    					//console.log('DELTAX', deltax);
		    					for(var deltay = -1; deltay <= 1; deltay++){
			    					
			    					if(cell.x+deltax>0&&cell.y+deltay>0&&deltax+deltay!=0){
			    						console.log('check neighberhoud', cell.x+deltax, cell.y+deltay);
			    						console.log('ROZLEWANIE', player.playerid, player.amount, person.fillamount, 'xy', cell.x, cell.y);
			    						Map.find({ 'x': cell.x+deltax, 'y': cell.y+deltay}, function (err, cellToCheck) {
			    							if(err){
			    								console.log(err);
			    							}
			    							console.log('SPRAWDZ CZY MOZNA ROZLAC', cellToCheck);
			    						});
			    					}
			    					//jak w wybranej komorce (x+deltax, y+deltay) nie ma komorek gracza, dodaj nadmiar
			    				}
		    				}
		    				//wylosuj komorke w promieniu 1 kratki, przenies nadmiar
							*/
		    			}
		    			
		    		});
		    	});
		    });
		    isRozlane = true;
		});
	}
}

//var isRozlane = true;
//var intervalRozlej = setInterval(rozlej, 5000);

//clearInterval(intervalGrow);

//grow();

export default MapEvents;
