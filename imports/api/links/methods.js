// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Assets } from './links.js';

import { Maps } from './links.js';
import { Resources } from './links.js';
import { Buildings } from './links.js';

import { Links } from './links.js';
import { Games } from './links.js';

import { Producers } from './links.js';
import { Cities } from './links.js';
import { Bids } from './links.js';
import { History } from './links.js';
import { Acts } from './links.js';

import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { baseUsers } from '../../startup/both/index.js';

import { WebApp } from 'meteor/webapp';

Meteor.methods({
  'links.insert'(title, url) {
    check(url, String);
    check(title, String);

    return Links.insert({
      url,
      title,
      createdAt: new Date(),
    });
  },

});

var resources = ["m1", "m2", "f1", "f2"];
var factoryKinds = ["m1", "m2", "f1", "f2", "p1", "p2"];

// WebApp.connectHandlers.use('/hello', (req, res, next) => {
//   res.writeHead(200);
//   res.end(`Hello world from: ${Meteor.release}`);
// });

// WebApp.connectHandlers.use('/map', (req, res, next) => {
//   res.writeHead(200);
//   adminGames  = Games.find({"role": "admin"}).fetch();
//   res.end(JSON.stringify(adminGames));
// });


export const RandomProducer = new ValidatedMethod({
  name: 'producers.makeRandom',
  validate ({}) {},
  run({chosenType, gameCode, bidKind, kindMax = 4}) {
    chosenType = Math.floor(Math.random()*6);
    if (!this.isSimulation) {
        var buyCosts = {
          "m1": { "m1": 0, "f1": 2, "m2": 1, "f2": 0 },
          "m2": { "m1": 1, "f1": 0, "m2": 0, "f2": 2 },
          "f1": { "m1": 1, "f1": 0, "m2": 0, "f2": 1 },
          "f2": { "m1": 0, "f1": 1, "m2": 1, "f2": 0 },
          "p1": { "m1": 2, "f1": 0, "m2": 2, "f2": 0 },
          "p2": { "m1": 0, "f1": 2, "m2": 0, "f2": 2 },
        };
        var bidKinds = {
          "m1": "f1",
          "m2": "f2",
          "f1": "m2",
          "f2": "m1",
          "p1": "m1",
          "p2": "f1"

        }
        var prodValues = {
          "m1": {"m1": 3, "pollution": 2},
          "m2": {"m2": 3, "pollution": 2},
          "f1": {"f1": 3, "pollution": 1},
          "f2": {"f2": 3, "pollution": 1},
          "p1": {"pollution": -3},
          "p2": {"pollution": -2},
        };
        var prodCosts = {
          "m1": { "m1": 0, "f1": 1, "m2": 0, "f2": 0 },
          "m2": { "m1": 0, "f1": 0, "m2": 0, "f2": 1 },
          "f1": { "m1": 1, "f1": 0, "m2": 0, "f2": 0 },
          "f2": { "m1": 0, "f1": 0, "m2": 1, "f2": 0 },
          "p1": { "m1": 0, "f1": 0, "m2": 0, "f2": 0 },
          "p2": { "m1": 0, "f1": 0, "m2": 0, "f2": 0 },
        };
        var kinds = Object.keys(buyCosts);
        
        //make this kindChosen number random, or incrementing
        var kindChosen = kinds[chosenType];

        var thisYear = Games.findOne({$and: [{"role": "admin"}, {"gameCode": gameCode}]});
        thisYear = thisYear.year;

        var currentProd = {
          "kind": kindChosen,
          "buyCost": buyCosts[kindChosen],
          "bidKind": bidKind,
          "prodValues": prodValues[kindChosen],
          "prodCosts": prodCosts[kindChosen],
          "gameCode": gameCode,
          "owned": false,
          "visible": true,
          "owner": 0,
          "durability": 0,
          "roundNotes": [],
          "yearAdd": thisYear
        };

        //pick a random kind
        //populate producers with a producer with a prod cost, prodvalues, ""
        Producers.insert(currentProd);
        /******* GET THE KEY OF THE PRODUCER INSERTED
        make a bid on it from every team
        ********/
        kindProducers = Producers.find({$and: [{"bidKind": res}, {"gameCode": gameCode}, {"owned": false}, {"visible": true}]}, {sort: {"yearAdd": 1}}).fetch();
        
        if (kindProducers.length > kindMax) {
          Producers.update({"_id": kindProducers[0]["_id"]}, {$set: {"visible": false}});
        }
    }
    return true;
  }
});

export const UpdateBid = new ValidatedMethod({
  name: 'bids.afford',
  validate ({}) {},
  run ({bidId, affordability}) {
    if (!this.isSimulation){
      // console.log(bidId + " " + affordability);
      if (affordability!= undefined){
        Bids.update(
          {"_id": bidId}, 
          {$set: {
            "affordability": affordability
            }
          });
      }
      return true;
    }
  }
});

export const ClearBids = new ValidatedMethod({
  name: 'bids.clear',
  validate ({}) {},
  run ({producer}) {
    if (!this.isSimulation){
      // console.log("clearing bids");
      Bids.update({"producer": producer}, {$set: {"bidVal": 0}});
    }
  }
});

export const RunBids = new ValidatedMethod({
  name: 'bids.buy',
  validate ({}) {},
  // validate ({}) {

  // },
  run({gameCode}) {
    // console.log(player + " " + producer);

    if (!this.isSimulation) {
      

      async function clearBids (producer) {
        // return await Bids.
        // >> currently these bids are zeroed out, they could be altogether removed, they could also be left alone
      }

      async function commitBid (bid, teams, resources) {
        // >> check affordability
        console.log(JSON.stringify(resources) + " " + JSON.stringify(bid));
        newRes = resources[bid["group"]];
        oldRes = newRes;
        newRes[bid["bidKind"]] -=  bid["bidVal"];

        if (newRes[bid["bidKind"]] < 0) {
          console.log("somehow this bid won though it's unaffordable what the fck " + JSON.stringify(bid));
          return true;
        }
        // >> change team resources
        else {
          console.log("committing the bid!!");
          thisGame = Games.findOne({$and: [{"playerName": bid.group}, {"role": "base"}, {"gameCode": bid.gameCode}]});
          await Games.update({"_id": thisGame._id }, {$set: {res: newRes}});

        // >> change producer owner
          await Producers.update({"_id": bid.producer}, {$set: { "owned": true,  "ownerId": thisGame.playerId, "ownerGameId": thisGame._id, "ownerName": thisGame.group}});

        // >> add log about producer purchase
          evLog = bid;
          evLog["oldRes"] = oldRes;
          evLog["newRes"] = newRes
          MakeLog.call({"key": "ProducerAcquire", "log": evLog});

        // >> give note to success of bid?

        // >> give notes to teams whose bids failed
          // failBids = await Bids.find({$and: [{producer: bid.producer}, {}]})
          // await Games.update()

        // >> change game phase to post-bid
          await Games.update({$and: [{"role": "admin"}, {"gameCode": bid.gameCode}]}, {$set: {"phase": "post-bid"}})
          return true;
          // return await resourceChange();
        }
      }

      async function bidTieMessage (bidTeams) {
        // return await updateTeamNotes();
      }

      async function resolveBids (producer, gameCode) {
        prodBids = await Bids.find({"producer": producer._id}, {sort: {"bidVal": -1}}); // << Do I care about this sorting?
        producerBids = prodBids.fetch();
        diffTeams = await Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]});
        diffTeams = diffTeams.fetch();
        teamResources = diffTeams.reduce( function(map, obj) {map[obj.playerName] = obj.res; return map;}, {});

        maxBid = 0;
        maxBidObj = {};
        maxTie = false;
        bidResources = producer.bidKind;
        bid = {};
        // console.log(producerBids);
        for (pb in producerBids) {
          bid = producerBids[pb];
          bidValue = bid.bidVal;
          teamRes = teamResources[producerBids[pb]["group"]][bid["bidKind"]]
          // console.log(bidValue +  " " + teamRes);
          if (bidValue > 0  && bidValue <= teamResources[producerBids[pb]["group"]][bid["bidKind"]]) {
            if (bidValue == maxBid) {
              maxTie = true;
            }
            else if (bidValue > maxBid) {
              maxBid = bidValue;
              maxBidObj = bid;
              maxTie = false;
            }
          }
        }
        // console.log(maxBid + " " + maxTie + " ");
        if (maxBid == 0) {
          // return await noBids();   // ugh can skip
        }
        else if (maxTie == false){
          // console.log("false maxTie found!");
          return await commitBid(maxBidObj, diffTeams, teamResources);
        }
        else {
          // return await bidTieMessage(bidTeams);   // ugh can skip
        }
      }

      async function runThroughBids(gameCode) {
        allProds = await Producers.find({$and: [{"gameCode": gameCode}, {"owned": false}]});
        allProducers = allProds.fetch();
        for (ap in allProducers) {
          await resolveBids(allProducers[ap], gameCode);
          await clearBids(allProducers[ap]);
        }
      }
      
      runThroughBids(gameCode);
      
      /*
      Producers.find({$and: [{"gameCode": gameCode}, {"owned": false}]}).forEach(function (prod) {

        allBids = Bids.find({$and: [{"gameCode": gameCode}, {"producer": prod._id}]}, {sort: {"bidVal": -1}}).fetch();
        // maybe write another function to ensure removal of unaffordable bids?
        purchased = "not yet";
        affBids = []
        for (i in allBids) {
          bidder = Games.findOne({$and: [{"playerId": allBids[i].baseId}, {"gameCode": gameCode}]});
          if (bidder.res[allBids[i].bidKind] >= allBids[i].bidVal && allBids[i].bidVal > 0) {
            affBids.push(allBids[i]);
          }
        }
        // console.log(affBids);

        for (i in affBids) {
          i = parseInt(i)
          // console.log(i + " " + purchased); 
          if(purchased == "not yet"){
            if (i < (affBids.length - 1)){
              // console.log(i+1);
              // console.log(affBids[i]);
              // console.log(affBids[(i + 1)]);
              if (affBids[i].bidVal == affBids[i + 1].bidVal) {
                //raise alerts that bid failed!
                purchased = "bid clash";
                AddTeamNote.call({"gameCode": gameCode, "baseId": affBids[i].baseId, "notes": ["Bid failed cause it clashed with someone else!"]})
                AddTeamNote.call({"gameCode": gameCode, "baseId": affBids[i + 1].baseId, "notes": ["Bid failed cause it clashed with someone else!"]})
                console.log("bid clash");
              }
              else {
                // bidder = Games.findOne({"_id": allBids[i].baseId});
                purchased = "bid success";
                console.log("bid success cause top bid led");
                BuyProducer.call({"producer": prod._id, "player": affBids[i].baseId, "gameCode": gameCode, "bid": affBids[i]}, function (err, res){
                  if (err) {console.log(err);}
                });
                AddTeamNote.call({"gameCode": gameCode, "baseId": affBids[i].baseId, "notes": ["Your bid succeeded!"]})
                purchased = true;
              }
            }
            else {
              console.log("bid success cause only 1 bid");
              purchased = "bid success";
              BuyProducer.call({"producer": prod._id, "player": affBids[i].baseId, "gameCode": gameCode, "bid": affBids[i]}, function (err, res){
                if (err) {console.log(err);}
              });
              purchased = true;
            }
          }
        }

        ClearBids.call({"producer": prod._id});
      });
      */
    }
    return true;
  }
});


export const BuyProducer = new ValidatedMethod({
  name: 'producers.buy',
  validate ({}) {},
  // validate ({}) {

  // },
  run({producer, player, gameCode, bid}) {
    console.log(player + " " + producer);

    if (!this.isSimulation) {
      prod = Producers.findOne({"_id": producer})
      cost = prod.buyCost;
      thisCity = Games.findOne({$and: [{"playerId": player}, {"gameCode": gameCode}, {"role":"base"}]});
      if (thisCity) { 
        res =  thisCity.res;
        canbuy = true;
        
        res[bid.bidKind] = thisCity.res[bid.bidKind] - bid.bidVal;
        if (canbuy == true){
          Producers.update({"_id": producer}, {$set: {"owned": true, "ownerId": player}});
          Games.update({"_id": thisCity._id}, {$set: {"res": res}});
        }
        else {
          throw new Error("Wasn't able to afford the purchase!");
        }
      }
      else {
        throw new Error("Purchase failed, city not found!");
      }
    }
    return true;
  }
});

export const ToggleFactory = new ValidatedMethod({
  name: 'producers.toggle',
  validate ({}) {},

  run ({producerId, currentStatus, gameCode, baseId}) {
    // Producers.find()
    thisGame = Games.findOne({$and: [{"playerId": baseId}, {"gameCode": gameCode}, {"status": "running"}, {"role": "base"}]});
    runners = Producers.find({$and: [{"running": true}, {"gameCode": gameCode}, {"owned": true}, {"ownerId": baseId}]}).fetch();
    newStatus = currentStatus;
    changed = false;
    if (runners.length < thisGame.population && currentStatus == false) {
      newStatus = true;
      changed = true;
    }
    if (currentStatus == true) {
      newStatus = false;
      changed = true;
    }

    Producers.update({"_id": producerId}, {$set: {"running": newStatus}});
    Acts.insert({
      "time": (new Date()).getTime(),
      "key": "factoryToggle",
      "producerId": producerId,
      "pastStatus": currentStatus,
      "newStatus": newStatus,
      "gameCode": gameCode,
      "baseId": baseId,
      "changed": changed
    });
    //***TODO: add game code, groupId, groupName
  }
});

export const MakeLog = new ValidatedMethod({
  name: 'logs.add',
  validate ({}) {},

  run ({key, log}) {
    log["key"] = key;
    log["time"] = (new Date()).getTime();
    Acts.insert(log);
  }
});

export const ConsumeResources = new ValidatedMethod({
  name: 'producers.consume',
  validate ({}) {},

  run ({gameCode}) {
    // city = Cities.findOne({"name": prod["owner"]});
    if (!this.isSimulation){
      admin = Games.findOne({$and: [{"gameCode": gameCode}, {"role": "admin"}]});
      
      if ("year" in admin) { currYear = admin.year; }
      else { currYear = 1; }

      allBases = Games.find({$and: [{"gameCode": gameCode}, {"role": "base"}]}).fetch();
      // ResetFactoryNotes.call({gameCode});

      for (b in allBases){
        base = allBases[b];
        res = base.res;
        newpoll = parseInt(base.pollution);
        newpop = parseInt(base.population);
        newhapp = parseInt(base.happiness);
        workers = newpop;
        freshFactCount = {"m1": 0, "m2": 0, "f1": 0, "f2": 0, "p1": 0, "p2": 0};
        // factCount = city.factoryCount;
        parks = 0;
        roundNotes = base.roundNotes;
        if (roundNotes == undefined) {
          roundNotes = [];
        }
        // console.log("base " + base.playerId);
        // console.log(Producers.find({"owned": true}).fetch());
        allProds = Producers.find({$and: [{"gameCode": gameCode}, {"owned": true}, {"ownerId": base.playerId}, {"running": true}]}).fetch();
        affordableProds = [];
        // console.log(allProds);
        for (p in allProds){
          prod = allProds[p];
          if (workers > 0){
            
            affordable = true;
            for (r in prod.prodCosts) {
              if ((res[r] -  prod.prodCosts[r]) < 0) {
                affordable = false;
              }
            }

            // console.log(affordable + " " + prod._id);
            if (affordable == true) {
              for (r in prod.prodCosts) {
                res[r] -= prod.prodCosts[r];
              }
              for (r in prod.prodValues) {
                if (r != "pollution"){
                  res[r] += Math.round(prod.prodValues[r]);
                }
                else {
                  newpoll = newpoll + prod.prodValues[r];
                }
              }
              Producers.update({_id: prod._id}, {$set: {"roundNotes": ["Run successful!"], "roundRun": true}}, {multi: false});
            }
            else {
              dur = prod.durability + 1;
              Producers.update({_id: prod._id}, {$set: {"durability": dur, "roundNotes": ["Lack of resources to run!"], "roundRun": true}}, {multi: false});
            }
            freshFactCount[prod.kind] += 1;
            if (prod.kind == "p1" || prod.kind == "p2") {
              parks += 1;
            }
            workers = workers - 1;
          }
          else {
            Producers.update({_id: prod._id}, {$set: {"running": false, "roundNotes": ["Lack of people to run!"], "roundRun": true}}, {multi: false});
          }
        }

        var availFood = res.f1 + (res.f2*1.0);
        var foodToPoll = availFood;
        if (newpoll > 0) {
          foodToPoll = foodToPoll / newpoll;
        }

        // roundNotes.push("food: " + availFood);

        if (foodToPoll > 2) {
          newpop = newpop + 1;
          roundNotes.push("Your people are well fed, your city is growing!");
        }

        else if (foodToPoll < 0.7) {
          newpop = newpop - 1;
          roundNotes.push("Your people are starving, your city is shrinking!");
        }

        var parksToPop = (parks * 1.0);
        if (newpop > 0){
          parksToPop = parksToPop / newpop;
          if (parksToPop  <= 0.2) {
            newhapp -= 1;          
            roundNotes.push("Your lack of parks is making people sad");
          }
          else if (parksToPop >= 0.4) {
            newhapp += 1;
            roundNotes.push("Your parks bring joy!");
          }
        }
        else {
          newhapp = 1;
          roundNotes.push("No people! Defaulting to 1 happiness");
        }

        // roundNotes.push("parks to population ratio:  " + parksToPop);

        if (newhapp < 0) {
          newpop = newpop - 1;
          roundNotes.push("Your city is too depressing, people don't want to live there!");
        }
        if (newhapp < 0) { newhapp = 0; }
        if (newpoll < 0) { newpoll = 0; }
        if (newpop < 0) { newpop = 0; }

        newStats = {
          "res": res,
          "pollution": newpoll,
          "happiness": newhapp,
          "population": newpop,
          "roundNotes": roundNotes,
          "year": (currYear + 1)
        }
        Games.update({"_id": base._id}, {$set: newStats});
        newStats["baseID"] = base._id;
        MakeLog.call({"key": "cityUpdate", "log": newStats})
        
      }
      console.log(currYear);
      Games.update({$and: [ {"gameCode": admin.gameCode}]}, {$set: {"year": (currYear + 1)}});
      Games.update({"_id": admin._id}, {$set: {"phase": "pre-bid"}})
      console.log("finishing round end");

      // change game phase

      return true;
    }
  }
});

export const SpreadPollution = new ValidatedMethod({
  name: 'pollution.spread',
  validate({}) {},
  run ({gameCode}) {
    allBases = Games.find({$and: [{"gameCode": gameCode}, {"role": "base"}]}).fetch(); //*****sort descending by pollution amount
    for (ab in allBases) {
      newpoll = parseInt(allBases[ab].pollution);
      base = allBases[ab];
      if (newpoll > 6) {
        pollLeak = (newpoll - 3 ) / 3;
        pollLeak = parseInt(pollLeak);
        console.log("leaking pollution " + pollLeak);
        
        if (pollLeak > 0){
          for (n in base.neighbors){
            console.log("hitting the neighbs " + base.neighbors[n] + " " + pollLeak);
            // neighGame = Games.findOne({$and: [{"gameCode": gameCode}, {"role": "base"}, {"playerName": base.neighbors[n]}]}); 
            neighGame = allBases.filter(obj => {
              return obj.playerName == base.neighbors[n];
            });
            neighGameIndex = allBases.findIndex(obj => {
              return obj.playerName == base.neighbors[n];
            });

            if (neighGame.length != 1) {
              console.log("why are there more or less than 1 base with this name wtf?! " + base.neighbors[n] + " " + JSON.stringify(neighGame) + " " + JSON.stringify(base.playerName) + " " + JSON.stringify(allBases));
            }
            else {
              //add a check that this neighbor's pollution is a valid number that can be added to
              allBases[neighGameIndex].pollution += pollLeak;
              allBases[neighGameIndex].roundNotes.push("A neighbor leaked pollution on to you!");
              allBases[b].roundNotes.push("You leaked " + pollLeak + " pollution on to " + base.neighbors[n]);
            }

            /*
            if(neighGame != undefined) {
              neighborPollution = parseInt(neighGame.pollution) + parseInt(pollLeak);
              // console.log("new neighbor pollution is " + neighborPollution);
              Games.update({_id: neighGame._id}, {$inc: {"pollution": pollLeak}});
              // console.log(neighGame.pollution);
              // Games.update({_id: neighGame._id}, {$push: {"roundNotes": "A neighbor leaked pollution on to you!"}})
              AddTeamNote.call({"gameCode": neighGame.gameCode, "baseId": neighGame.playerId, "notes": ["A neighbor leaked pollution on to you!"]}, function (err, res) {
                if (err) {console.log(err);}})

              leakNote = ["High pollution, leaked " + pollLeak + " pollution to " + base.neighbors[n]];
              AddTeamNote.call({"gameCode": base.gameCode, "baseId": base.playerId, "notes": leakNote}, function (err, res) {
                if (err) {console.log(err);} });
            }*/
            // roundNotes.push("High pollution, leaked " + pollLeak + " pollution to " + base.neighbors[n]);
          }
        }
      }
    }
    for  (ab in allBases) {
      Games.update({_id: allBases[ab]._id}, {$set: {"roundNotes": allBases[ab].roundNotes, "pollution": allBases[ab].pollution}});
    }
    // newlog = {"allTeams": Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]}).fetch()};
    // MakeLog.call({"key": "roundEndTeams", "log": newlog});
  }
});

export const AddTeamNote = new ValidatedMethod({
  name: 'notes.teamadd',
  validate ({}) {},
  run({gameCode, baseId, notes}) {
    if (!this.isSimulation){
      thisbase = Games.findOne({$and: [{"gameCode": gameCode}, {"playerId": baseId}]});
      // console.log(thisbase.roundNotes);
      Games.update( {"_id": thisbase._id}, {$push: {"roundNotes": {$each: notes}}} );
      // console.log(Games.findOne({ "_id":thisbase._id }).roundNotes);
      return true;
    }
  }
});

export const ResetFactoryNotes = new ValidatedMethod({
  name: 'resetnotes.factory',
  validate ({}) {},
  run({gameCode}) {
    if (!this.isSimulation){
      Producers.update({"gameCode": gameCode}, {$set: {"roundNotes": [], "roundRun": false}}, {multi: true});
    }
  }
});

export const ResetTeamNotes = new ValidatedMethod({
  name: 'resetnotes.team',
  validate ({}) {},
  run({gameCode}) {
    if (!this.isSimulation){
      // console.log("")
      Games.update({"gameCode": gameCode}, {$set: {"roundNotes": [], "roundRun": false}}, {multi: true});
    }
  }
});

export const AsyncTest = new ValidatedMethod({
  name: 'asyncTest',
  validate ({}) {},
  run({gameCode}) {
    async function test3() {
      console.log(4);
      console.log(5);
      // prods = await Producers.find({"owned": false});
      // console.log(prods.fetch());
      console.log(6);
      return true;
    }
    async function test2() {
      console.log(7);
      console.log(8);
      await test3();
      console.log(9);
      // return true;
    }
    async function test1() {
      console.log(1);
      console.log(2);
      console.log(3);
      return await test2();
    }

    test1();
  }
});

export const SpawnFactories = new ValidatedMethod({
  name: 'newFacts',
  validate ({}) {},
  run({gameCode, producerCount}) {
    ///// Randomize resources, and make factories if they don't have 4
    diffResources = shuffle(resources);
    if (producerCount == -1) {
      producerCount = Games.findOne({$and: [{"role": "admin"}, {"gameCode": gameCode}]}).groupList.length - 1
    }

    console.log(producerCount);

    for (var i = 0; i < producerCount; i++) { 
      //for each kind of resource 
        //if there are not 4 factories available with that bidkind, add a factory
      res = diffResources[(i % resources.length)];
      RandomProducer.call({"chosenType": i, "gameCode": gameCode, "bidKind": res});
      

    }
    
    endBases = {"allTeams": Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]}).fetch()};
    MakeLog.call({"key": "roundEndTeams", "log": endBases});
    ownedFacts = Producers.find({$and: [{"gameCode": gameCode}, {"owned": true}]}).fetch();
    MakeLog.call({"key": "ownedFactories", "log": ownedFacts});
    publicFacts = Producers.find({$and: [{"gameCode": gameCode}, {"owned": false}]}).fetch();
    MakeLog.call({"key": "publicFactories", "log": publicFacts}); 
  }
});

export const NewRound = new ValidatedMethod({
  name: 'newRound',
  validate ({}) {},
  run({gameCode, producerCount = -1}) {
    //reset factory notes, and team notes
    if (!this.isSimulation){
      console.log("new rounding");
      ResetFactoryNotes.call({"gameCode": gameCode});

      ResetTeamNotes.call({"gameCode": gameCode});

      RunBids.call({"gameCode": gameCode}, (err, res) => {
        if (err) {console.log(err);}
        else {
          ConsumeResources.call({"gameCode": gameCode}, (err, res) => {
            if (err) { console.log(err); }
            else {
              console.log("calling back after completion!");
              // SpreadPollution.call({"gameCode": admin.gameCode});
              SpreadPollution.call({"gameCode": gameCode}, (err, res) => {
                if (err) { console.log(err); }
                else {
                  SpawnFactories.call({"gameCode": gameCode, "producerCount": producerCount});
                }
              });
            }
          });
        }
      })
          

      /*      
      ConsumeResources.call({"gameCode": gameCode}, (err, res) => {
        if (err) {console.log(err);}
        else {
          RunBids.call({"gameCode": gameCode}, (err,res) => {
            if (err) {console.log(err);}
            else {
              ///// Randomize resources, and make factories if they don't have 4
              diffResources = shuffle(resources);
              for (var i = 0; i < producerCount; i++) { 
                //for each kind of resource 
                  //if there are not 4 factories available with that bidkind, add a factory
                res = diffResources[(i % resources.length)];
                  if (Producers.find({$and: [{"bidKind": res}, {"gameCode": gameCode}, {"owned": false}, {"visible": true}]}).fetch().length < 4) {
                    RandomProducer.call({"chosenType": i, "gameCode": gameCode, "bidKind": res}, (err, res) => {
                      if (err) {console.log(err);}
                    });
                }

              }
              endBases = {"allTeams": Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]}).fetch()};
              MakeLog.call({"key": "roundEndTeams", "log": endBases});
              ownedFacts = Producers.find({$and: [{"gameCode": gameCode}, {"owned": true}]}).fetch();
              MakeLog.call({"key": "ownedFactories", "log": ownedFacts});
              publicFacts = Producers.find({$and: [{"gameCode": gameCode}, {"owned": false}]}).fetch();
              MakeLog.call({"key": "publicFactories", "log": publicFacts});

            }
          });
        }
      });
      */
      
      console.log("new round called");
    }
  }
});

export const FlushProducers = new ValidatedMethod({
  name: 'producers.flush',
  validate ({}) {},
  run ({gameCode}){
    Producers.update({$and: [{"owned": false, "visible": true, "gameCode": gameCode}]}, {$set: {"visible": false}}, {multi: true});
    console.log("producers flushed");
  }
});

export const TradeResources = new ValidatedMethod({
  name: 'resources.trade',
  validate ({amount, resource, from, to}) {
    const errors = [];
    if (amount < 0) {
      errors.push("negative number");
    }
    if (errors.length) {
      throw new ValidationError(errors);
    }
  },
  run ({amount, resource, from, to}){
    // Producers.update({$and: [{"owned": false, "visible": true}]}, {$set: {"visible": false}}, {multi: true});
    // console.log("producers flushed");
    // resres = "res." + resource;
    // Cities.findOne({"_id": from})
    // console.log(Cities.findOne({"name": from}));
    // console.log(from);
    if (!this.isSimulation){
      fromGroup = Games.findOne({$and: [{"gameCode": from.gameCode},  {"group": from.group}, {"role": "base"}]});
      fromres = fromGroup.res;
      toGroup = Games.findOne({$and: [{"gameCode": to.gameCode},  {"group": to.group}, {"role": "base"}]});
      tores = toGroup.res;
      logObj = {"from": from, "to": to, "amount": amount, "resource": resource, "gameCode": from.gameCode, "togameCode": to.gameCode};
      // tores = Cities.findOne({"name": to}).res;
      if(parseInt(fromres[resource]) >= amount){
        fromres[resource] = parseInt(fromres[resource]) - parseInt(amount);
        tores[resource] = parseInt(tores[resource]) +  parseInt(amount);
        Games.update({"_id": fromGroup._id}, {$set: {"res": fromres}});
        Games.update({"_id": toGroup._id}, {$set: {"res": tores}});
        logObj["success"] = true;
        MakeLog.call({"key": "tradeResource", "log": logObj});
        return true;
      }
      else {
        console.log("under resourced");
        // throw new Error("not enough resource!");
        logObj["success"] = false;
        MakeLog.call({"key": "tradeResource", "log": logObj});
        throw new Meteor.Error('Not enough resource!!', "Can't find my pants");
      }
    }
  }
});

export const ResetAll = new ValidatedMethod({
  name: 'setup.all',
  validate({}) {},
  run({gameCode}) {
    factCount = {"m1": 0, "m2": 0, "f1": 0, "f2": 0, "p1": 0, "p2": 0};

    Games.update(
      {$and: [
        {"gameCode": gameCode}, 
        {"role": "base"}]
      }, 
      {$set: {
        "factoryCount": factCount, 
        "res": {"m1": 2, "m2": 2, "f1": 2, "f2": 2}, 
        "pollution": 0, 
        "population": 5, 
        "happiness": 5,
        "roundNotes": []
      }}, {multi: true, upsert: true});
    // Cities.update({"name": "city2"}, {$set: {"name": "city2", "factoryCount": factCount, "res": {"m1": 2, "m2": 2, "f1": 2, "f2": 2}, "poll": 0, "population": 5, "happiness": 5}}, {upsert: true})
    Producers.remove({});
    
    // Assets.update({$and: [{"name": "m1"}, {"kind": "producer"}]}, {$set: {"name": "m1", "regName": "Steel Factory", "img": "img/buildings/factory1.png", "kind": "producer"}}, {upsert: true});
    // Assets.update({$and: [{"name": "m2"}, {"kind": "producer"}]}, {$set: {"name": "m2", "regName": "Gold Factory", "img": "img/buildings/factory2.png", "kind": "producer"}}, {upsert: true});
    // Assets.update({$and: [{"name": "f1"}, {"kind": "producer"}]}, {$set: {"name": "f1", "regName": "Food Crop", "img": "img/buildings/farm1.png", "kind": "producer"}}, {upsert: true});
    // Assets.update({$and: [{"name": "f2"}, {"kind": "producer"}]}, {$set: {"name": "f2", "regName": "Cotton Farm", "img": "img/buildings/farm2.png", "kind": "producer"}}, {upsert: true});
    // Assets.update({$and: [{"name": "p1"}, {"kind": "producer"}]}, {$set: {"name": "p1", "regName": "Park", "img": "img/buildings/park1.png", "kind": "producer"}}, {upsert: true});
    // Assets.update({$and: [{"name": "p2"}, {"kind": "producer"}]}, {$set: {"name": "p2", "regName": "Fountain", "img": "img/buildings/park2.png", "kind": "producer"}}, {upsert: true});

    // Assets.update({$and: [{"name": "m1"}, {"kind": "resource"}]}, {$set: {"name": "m1", "regName": "Steel", "img": "img/icons/steel_med.png", "kind": "resource"}}, {upsert: true});
    // Assets.update({$and: [{"name": "m2"}, {"kind": "resource"}]}, {$set: {"name": "m2", "regName": "Gold", "img": "img/icons/gold_med.png", "kind": "resource"}}, {upsert: true});
    // Assets.update({$and: [{"name": "f1"}, {"kind": "resource"}]}, {$set: {"name": "f1", "regName": "Food", "img": "img/icons/food_med.png", "kind": "resource"}}, {upsert: true});
    // Assets.update({$and: [{"name": "f2"}, {"kind": "resource"}]}, {$set: {"name": "f2", "regName": "Cotton", "img": "img/icons/cotton_med.png", "kind": "resource"}}, {upsert: true});
  }
});

export const MakeMap = new ValidatedMethod({
  name: 'map.make',
  validate ({}) {},
  run({gameCode}) {

    /*
    first assign ownership of cells for the first four teams - four corners of the grid - 0,0; 13,0; 0,13; 13,13

    then add 2 ores (m1, m2), and 1 resource (f1) in each team's grid.
    
    add some ores and a river in no man's land.

    add 4 2x2 ores, and 1 river through the map

    */

    async function seedResources (gameCode) {
      
    }

    async function makeTeamCells (cornerX, cornerY, width, height, gameCode, groupId, groupName, groupGame) {
      var thisX = cornerX;
      var thisY = cornerY;
      for (thisX = cornerX; thisX < cornerX + width; thisX += 1){
        for (thisY = corners; thisY < cornerY + height; thisY += 1) {
          await Maps.update(
            {$and: [{"x": thisX}, {"y": thisY}, {"gameCode": gameCode}]}, 
            {$set: {"owner": groupName, "ownerId": "groupId", "ownerGame": groupGame}}, 
            {upsert: true}
          );
        }
      }
    }

    async function mapSetup(gameCode) {
      corners = [[0, 0], [13, 0], [0, 13], [13, 13]];
      dims = [[4, 4], [4, 4], [4, 4], [4, 4]];
      teams = await Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]});
      teams = teams.fetch();
      for (t in teams) {
        if (t < 4){
          await makeTeamCells(corners[t][0], corners[t][1], dims[t][0], dims[t][1], gameCode, teams[t]["playerId"], teams[t]["group"], teams[t]["_id"]);
        }
      }

      await seedResources (gameCode);
    }

    mapSetup(gameCode);
    

    //place an ore
    // Resources.insert({"gameCode": gameCode, "category": "ore", "kind": "m1", "name": "Gold Ore"});

    //
  }
});

export const StartGame = new ValidatedMethod({
  name: 'game.start',
  validate({}) {},
  run({cityCount, adminId, adminUsername}) {
    if (!this.isSimulation) {
      // baseList = shuffle(baseUsers);
      baseList = baseUsers;
      baseList = baseList.slice(0, cityCount);
      allGames = Games.find({}, {"gameCode": 1}).fetch();
      
      gameCodes = [];
      allGames.forEach(function (game) {gameCodes.push(game.gameCode);});
      // console.log(baseList);
      console.log(gameCodes);
      newgc = parseInt(Math.random()*100000).toString();
      while (newgc in gameCodes) {
        newgc = parseInt(Math.random()*100000).toString();;
      }
      var year = 1;

      Games.insert({
        "gameCode": newgc, 
        "playerName": adminUsername, 
        "playerId": adminId,
        "role": "admin",
        "status": "running",
        "group": "none",
        // "groupList":  baseList.slice(0,cityCount),
        "groupList":  baseList,
        "year": year
      });
      for (var i = 0; i < cityCount; i++) {
        // console.log(baseList[i]);
        console.log(Meteor.users.find({}).fetch());
        neighbors = [];
        if (i == 0) {
          neighbors.push(baseList[cityCount - 1]);
          neighbors.push(baseList[i + 1]);
        }
        else {
          neighbors.push(baseList[i - 1]);
          neighbors.push(baseList[((i + 1) % cityCount)]);
        }
        // neighbors = baseList[i - 1];
        JoinGame.call({"playerName": baseList[i], "playerId": Meteor.users.findOne({"profile.name": baseList[i]})._id, "gameCode": newgc, "role": "base", "neighbors": neighbors}, (err, res) => {
          if (err) {
            console.log(err);
            return err;
          }
          else {
            return res;
          }
        });
      }
    }
  }
});

export const ToggleGameRunning = new ValidatedMethod({
  name: 'game.toggle',
  validate({}) {},
  run({gameCode, currentState}) {
    if (!this.isSimulation) {
      var newState = "running";
      if (currentState == "running") {newState = "paused";}
      Games.update({"gameCode": gameCode}, {$set: {"status": newState}}, {multi: true});
    }
  }
});

export const ChangeTeam = new ValidatedMethod({
  name: 'team.change',
  validate({}) {},
  run({gameCode, player, group}) {
    if (!this.isSimulation) {
      Games.update({$and: [{"gameCode": gameCode}, {"playerName": player}]}, {$set: {"group": group}});
    }
  }
});

export const MakeBase = new ValidatedMethod({
  name: 'team.new',
  validate({}) {},
  run({gameCode, playerName}) {
    if (!this.isSimulation) {
      player = Meteor.users.findOne({"profile.name": playerName});
      if (player != undefined){
        playerId = player._id;
        JoinGame.call({"playerName": playerName, "playerId": playerId, "gameCode": gameCode, "role": "base", "neighbors": []});
        bases = [];
        Games.find({$and: [{"gameCode": gameCode}, {"role": "base"}]}).forEach(function (base) {
          bases.push(base.playerName);
        });
      }
      Games.update({$and: [{"gameCode": gameCode}, {"role": "admin"}]}, {$set: {groupList: bases}});
    }
  }
});

export const AddNeighbor = new ValidatedMethod({
  name: 'team.neighbor',
  validate({}) {},
  run({gameCode, cityName, neighbor}) {
    if (!this.isSimulation) {
      console.log(neighbor);
      if (neighbor != "empty") {
        if (Games.findOne({$and: [{"gameCode": gameCode}, {"role": "base"}, {"playerName": neighbor}]}) != undefined){
          Games.update({$and: [{"gameCode": gameCode}, {"role": "base"}, {"playerName": cityName}]}, {$addToSet: {"neighbors": neighbor}});
        }
      }
      else {
        console.log("emptying neighbors");
        Games.update({$and: [{"gameCode": gameCode}, {"role": "base"}, {"playerName": cityName}]}, {$set: {"neighbors": []}}); 
      }
    }
  }
});

shuffle = function(v){
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
};

generate_random_string = function(string_length){
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii);
    }
    return random_string;
}

// console.log(generate_random_string(5))


export const JoinGame = new ValidatedMethod({
  name: 'game.join',
  validate({}) {},
  run({playerName, playerId, gameCode, role, neighbors = []}) {
    if (!this.isSimulation) {
      console.log(gameCode);
      gameCode = gameCode.toLowerCase();
      gameCode = gameCode.trim();
      gameAdmin = Games.findOne({$and: [{"gameCode": gameCode}, {"role": "admin"}]});
      console.log(gameAdmin);

      if (gameAdmin != undefined) {

        var group = playerName;
        var deets = {
          "gameCode": gameCode,
          "playerName": playerName,
          "playerId": playerId,
          "role": role,
          "status": "running",  
        };
        if (role == "player"){
          //see which city has fewer players, and add to one of those cities.
          //re assign group in here.
          
          groupSizes = gameAdmin.groupList.map(function(gi) {  //gi = group index
            return {"groupIndex": gi, "groupSize": Games.find({$and: [{"gameCode": gameCode}, {"group": gi}]}).fetch().length};
          });
          sortedGroups = groupSizes.sort(function (a, b) {
            return (a.groupSize - b.groupSize);
          });
          grp = sortedGroups[0].groupIndex;
          console.log("group is " + grp);
          group = grp;

        }
        else if (role == "base") {
          deets["res"] = {"m1": 2, "m2": 2, "f1": 2, "f2": 2};
          deets["pollution"] = 2;
          deets["population"] = 5;
          deets["happiness"] = 5;
          deets["neighbors"] = neighbors;
        }

        deets["group"] = group;


        Games.update({
          "gameCode": gameCode, 
          "playerId": playerId,
          "playerName": playerName
        },{$set: deets}, {upsert: true});

      }
      else {
        throw new Error("game code doesn't exist");
      } 
      // if()
    }
  }
});

//TODO: fix baseID to be game document ID and not just user document ID

export const MakeBid = new ValidatedMethod({
  name: 'bid.make',
  validate({}) {},
  run({baseId, producer, group, gameCode, change, bidKind}) {
    if (!this.isSimulation) {
      var existBid = Bids.findOne({$and: [{"producer": producer}, {"group": group}]});
      if (existBid == undefined) {
        if (change < 0) {
          change = 0;
        }
        Bids.insert({
          "producer": producer,
          "group": group,
          "gameCode": gameCode,
          "baseId": baseId,
          "bidVal": change,
          "bidKind": bidKind
        });
      }
      else {
        // console.log(existBid.bidVal.toString());
        change = existBid.bidVal + change;
        if (change < 0) {
          change = 0;
        }
        if (change.toString() == "NaN") {
          // console.log("change is nan?");
          change = 0;
        }
        Bids.update({"_id": existBid._id}, {$set: {"bidVal": change}});
      }
      logObj = {
        "baseId": baseId,
        "producer": producer,
        "group": group,
        "gameCode": gameCode,
        "value": change,
        "bidKind": bidKind
      };
      MakeLog.call({"key": "BidAct", "log": logObj}, function (err, res) {
        if (err) {console.log(err);}
      });
    }
  }
});


export const ChangeStat = new ValidatedMethod({
  name: 'stat.admin',
  validate({}) {},
  run({gameCode, group, resource, amount}) {
    if (!this.isSimulation) {
      // console.log(gameCode + " " + group + " " + resource + " " + amount);
      // console.log(Games.findOne({$and: [{"gameCode": gameCode}, {"group": group}, {"role": "base"}]}));
      setObj = {};
      setObj[resource] = amount;
      // console.log(setObj);
      Games.update({$and: [{"gameCode": gameCode}, {"group": group}, {"role": "base"}]}, {$set: setObj} , {multi: false}, (err, res) => {
        if (err) {
          // console.log(err);
        }
        else {
          // console.log(res);
        }
      });
    }
  }
});

export const userExists = new ValidatedMethod({
  name: 'user.exists',
  validate({}) {},
  run ({username}) {
    if (!this.isSimulation){
      return !!Meteor.users.findOne({"username": username});
    }
  }
});