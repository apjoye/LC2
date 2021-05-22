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

export const CommitBids = new ValidatedMethod({
  name: 'bids.commit',
  validate ({}) {},
  run ({baseId, gameCode, commitState}) {
    if (!this.isSimulation) {
      console.log("changing bid commit state");
      // readyCities
      if (commitState == true) {
        console.log("truing ready");
        Games.update(
          {$and: [{"gameCode": gameCode}, {"role": "base"}]}, {$addToSet: {"readyCities": baseId}}, {multi: true}
        );
      }
      else {
        Games.update(
          {$and: [{"gameCode": gameCode}, {"role": "base"}]}, {$pull: {"readyCities": baseId}}, {multi: true}
        ); 
      }
      Games.update(
        {$and: [{"gameCode": gameCode}, {"role": "base"}, {"playerId": baseId}]}, {$set: {"bidCommit": commitState}}
      );
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


export const RunBids2 = new ValidatedMethod({
  name: 'bids2.buy',
  validate ({}) {},
  // validate ({}) {

  // },
  run({gameCode}) {
    // console.log(player + " " + producer);

    if (!this.isSimulation) {
      

      async function clearBids (producer, gameCode) {
        // return await Bids.
        // >> currently these bids are zeroed out, they could be altogether removed, they could also be left alone
        Bids.update({$and: [{"gameCode": gameCode}]}, {$set: {"bidVal": 0}}, {multi: true});
        Games.update({$and: [{"gameCode": gameCode}, {"role": "base"}]}, {$set: {"bidCommit": false, "readyCities": []}}, {multi: true});
      }

      async function commitBid (bid, teams, resources) {
        // >> check affordability
        // console.log(JSON.stringify(resources) + " " + JSON.stringify(bid));
        newRes = resources[bid["baseId"]];
        oldRes = newRes;
        newRes[bid["bidKind"]] -=  bid["bidVal"];

        if (newRes[bid["bidKind"]] < 0) {
          console.log("somehow this bid won though it's unaffordable what the fck " + JSON.stringify(bid));
          return true;
        }
        // >> change team resources
        else {
          console.log("committing the bid!!");
          thisGame = Games.findOne({$and: [{"playerId": bid.baseId}, {"role": "base"}, {"gameCode": bid.gameCode}]});
          await Games.update({
            "_id": thisGame._id }, 
            {$set: {
              res: newRes
            }
          });

        // >> change producer owner
          // console.log(bid);
          await Buildings.update(
            {"_id": bid.buildingId}, 
            {$set: { 
              "owned": true, 
              "state": "bought", 
              "ownerId": thisGame.playerId, 
              "ownerGame": thisGame._id, 
              "owner": thisGame.group, 
              "info": {"state": "acquired", "value": bid.bidVal, "kind": bid.bidKind},
              "roundAcquired": thisGame.year
            }
          });

        // >> add log about producer purchase
          evLog = bid;
          evLog["oldRes"] = oldRes;
          evLog["newRes"] = newRes;
          MakeLog.call({"key": "BuildingAcquire", "log": evLog});

        // >> give note to success of bid?

        // >> give notes to teams whose bids failed
          // failBids = await Bids.find({$and: [{producer: bid.producer}, {}]})
          // await Games.update()

        // >> change game phase to post-bid
          console.log("changing game phase");
          return true;
          // return await resourceChange();
        }
      }

      async function bidTieMessage (bidTeams) {
        // return await updateTeamNotes();
      }

      async function resolveBids (producer, gameCode) {
        prodBids = await Bids.find({"buildingId": producer._id}, {sort: {"bidVal": -1}}); 
        producerBids = prodBids.fetch();
        diffTeams = await Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]});
        diffTeams = diffTeams.fetch();
        teamResources = diffTeams.reduce( function(map, obj) {map[obj.playerId] = obj.res; return map;}, {});

        maxBid = 0;
        maxBidObj = {};
        maxTie = false;
        bidResources = producer.bidKind;
        bid = {};
        // console.log(producerBids);
        // do I want to make sure this is sorted?
        function compareBids(a, b) {
          if (a["bidVal"] > b["bidVal"]) return -1;
          if (a["bidVal"] < b["bidVal"]) return 1;
          return 0;
        }
        producerBids.sort(compareBids);
        // console.log(producerBids);
        // console.log(teamResources);

        for (pb in producerBids) {
          bid = producerBids[pb];
          bidValue = bid.bidVal;
          teamRes = teamResources[producerBids[pb]["baseId"]][bid["bidKind"]]
          
          if (bidValue > teamResources[producerBids[pb]["baseId"]][bid["bidKind"]]) {
            //this "bid" object failed cause of unaffordability
            console.log(bidValue +  " " + teamRes + " was unafordable ");
          }
          else if (bidValue > 0  && bidValue <= teamResources[producerBids[pb]["baseId"]][bid["bidKind"]]) {
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
          console.log("max bid was 0");
        }
        else if (maxTie == false){
          console.log("false maxTie found!");
          return await commitBid(maxBidObj, diffTeams, teamResources);
        }
        else {
          console.log("non zero max tie");
          console.log("bids on " + producer._id);
          return await Buildings.update({"_id": producer._id}, {$set: {"info": {"state": "tied", "value": maxBid, "kind": maxBidObj.kind}}})
          // return await bidTieMessage(bidTeams);   // ugh can skip
        }
      }

      async function runThroughBids(gameCode) {
        allProds = await Buildings.find({$and: [{"gameCode": gameCode}, {"owned": false}, {"state": "auction"}]});
        allProducers = allProds.fetch();
        var ap = 0;
        for (ap in allProducers) {
          await resolveBids(allProducers[ap], gameCode);
        }
        // await Games.update({$and: [{"role": "admin"}, {"gameCode": gameCode}]}, {$set: {"phase": "post-bid"}}, {$inc: {"year": 1}})
        await Games.update({$and: [{"gameCode": gameCode}]}, {$set: {"phase": "post-bid"}}, {multi: true});
        await clearBids(allProducers[ap], gameCode);
      }
      
      runThroughBids(gameCode);
    }
    return true;
  }
});


export const ToggleBuilding = new ValidatedMethod({
  name: 'toggle.build',
  validate ({}) {},

  run ({buildingId, currentStatus, gameCode, ownerId, runningBuilds = []}) {
    
    //*** TODO: at client end, try to pass the runners into runningBuilds ***//

    thisGame = Games.findOne({$and: [{"playerId": ownerId}, {"gameCode": gameCode}, {"status": "running"}, {"role": "base"}]});
    runners = [];
    if (runningBuilds == []){
      runners = Buildings.find({$and: [{"running": true}, {"gameCode": gameCode}, {"owned": true}, {"ownerId": ownerId}]}).fetch();
    }
    else {
      runners = runningBuilds;
    }
    newStatus = currentStatus;
    changed = false;
    if (currentStatus == true) {
      newStatus = false;
      changed = true;
    }
    else{
      if (runners.length < thisGame.population) {
        newStatus = true;
        changed = true;
      }
    }

    overEmp = runners.length - thisGame.population;
    // if (overEmp > 0) {
    //   for (var i = 0; i < overEmp; i++) {
    //     Buildings.update({"_id": runners[i]["_id"]}, {$set: {"running": false}});
    //   }
    // }

    Buildings.update({"_id": buildingId}, {$set: {"running": newStatus}});
    // console.log("building set to " + newStatus);

    Acts.insert({
      "time": (new Date()).getTime(),
      "key": "buildingToggle",
      "buildingId": buildingId,
      "pastStatus": currentStatus,
      "newStatus": newStatus,
      "gameCode": gameCode,
      "baseId": ownerId,
      "changed": changed
    });
  }
});

export const ReadNotif = new ValidatedMethod({
  name: 'logs.read',
  validate ({}) {},
  run ({logId, userId}) {
    Acts.update({"_id": logId}, {$addToSet: {"readBy": userId}});
  }
})


export const MakeLog = new ValidatedMethod({
  name: 'logs.add',
  validate ({}) {},

  run ({key, log}) {
    log["key"] = key;
    log["time"] = (new Date()).getTime();
    Acts.insert(log);
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

    for (let i = 0; i < producerCount; i++) { 
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

      // RunBids.call({"gameCode": gameCode}, (err, res) => {
      //   if (err) {console.log(err);}
      //   else {
      //     ConsumeResources.call({"gameCode": gameCode}, (err, res) => {
      //       if (err) { console.log(err); }
      //       else {
      //         console.log("calling back after completion!");
      //         // SpreadPollution.call({"gameCode": admin.gameCode});
      //         SpreadPollution.call({"gameCode": gameCode}, (err, res) => {
      //           if (err) { console.log(err); }
      //           else {
      //             SpawnFactories.call({"gameCode": gameCode, "producerCount": producerCount});
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
          

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

export const RunMine = new ValidatedMethod ({
  name: 'run.mine',
  validate ({}) {},
  run({gameCode, location, kind, groupName, groupGame, building}) {


    
  }
});

export const RunHunters = new ValidatedMethod ({
  name: 'run.hunt',
  validate ({}) {},
  run({gameCode, location, kind, groupName}) {

  }
})

export const RunBuildings = new ValidatedMethod({
  name: 'runall.build',
  validate ({}) {},
  // run({gameCode, group}) {
  run({gameCode, group = ""}) {
    if (!this.isSimulation) {
      // buildings = Buildings.find({$and:[{"gameCode": gameCode}, {"owner": group}]}).fetch();
      
      // console.log("runnning buildings");
      async function EatAndMake(gameId, building) {
        //enter ore use mode if ore found

        //produce with presence of ore (i.e. more pollution, and if possible, more metal)
        // console.log("entering eat and make");
        affordable = true;
        // thisGame = Games.findOne({"_id": groupGame});
        // console.log(thisGame);
        thisGame = Games.findOne({"_id": gameId});
        newRes = thisGame["res"];
        newPoll = thisGame["pollution"];
        roundEmployed = 0;
        running = false
        console.log("are we here?");
        if ("roundEmployed" in thisGame) { roundEmployed = thisGame["roundEmployed"]; }
        console.log("employed " + roundEmployed);
        if (!("notes" in thisGame)) {
          thisGame["notes"] = [];
        }

        if (roundEmployed < thisGame["population"]) {
          // console.log("we have employees!");
          for (r in building["prodCost"]) {
            if (building["prodCost"][r] > newRes[r]) {
              affordable = false;
            }
            newRes[r] = newRes[r] - building["prodCost"][r];
          }
          //neighborNeeds specifies requirement which restricts  placement
          if ("neighborNeed" in building) {
            if ("neighboringResource" in building) {
              nres =  Resources.findOne({"_id": building["neighboringResource"]});
              if (nres["stats"][building["neighborUse"]["res"]] >= building["neighborUse"]["amount"]) {
                affordable = true;
                nresuse = true;
              }
              else {
                affordable = false;
                console.log("neighboring needed resource is out of stock");
              }
            }
            else {
              affordable = false;
              console.log("this building needed a neighbor to run and also be placed but doesn't have it?!?!? please fix")
            }
          }
          if (affordable == false) {
            newRes[r] = thisGame["res"];
            // console.log(thisGame["res"]);
            console.log("was unaffordable");
            thisGame["notes"].push(building.name + " was unaffordable and did not run");
            return true;
          }
          else {
            roundEmployed += 1;
            thisGame["res"] = newRes;
            thisGame["pollution"] = newPoll;
            thisGame["notes"].push(building.name + " ran successfully!")
            usingResource = false;
            console.log("consumed stuff, checking out neighboring resources");

            //neighborUses gets used, if neighboring resource is present. Either by neighborneed or bonus mode
              //bonusProds is the extra production that happens is neighborUse succeeds
            //neighborAffect affects the neigboring resource

            if ("neighboringResource" in building) {
              nres =  Resources.findOne({"_id": building["neighboringResource"]});
              newnres = nres["stats"];
              neighbUse = false;
              console.log("found a neighboring resource");
              if ("neighborUse" in building) {
                console.log("gonna use a neighboring resource " + JSON.stringify(nres) + " " + JSON.stringify(building["neighborUse"]));
                if (nres["stats"][building["neighborUse"]["res"]] >= building["neighborUse"]["amount"]) {
                  console.log("neighboring resource available")
                  neighbUse = true;
                  newnres[building["neighborUse"]["res"]] -= building["neighborUse"]["amount"];
                }
                else {

                }
              }
              if ("neighborAffect" in building) {
                //currently assuming neighbor affect is only pollution
                if ("pollution" in newnres){
                  newnres["pollution"] += building["neighborAffect"]["pollution"];
                }
                else {
                  console.log("this neighboring affect was gonna receive some pollution but it doesn't have the pollution stat? ugh");
                }
              }

              if ("neighborBonus" in building) {
                console.log("bonus mode attempt");
                if ("pollution" in building["bonusProd"]){
                  newPoll += building["bonusProd"]["pollution"];
                }
                if (neighbUse == true) {
                  console.log("bonus mode resource use was affordable!")
                  newRes[building["bonusProd"]["res"]] += building["bonusProd"]["amount"];
                } 
              }
              console.log(building["neighboringResource"]);
              console.log(newnres);
              await Resources.update({"_id": building["neighboringResource"]}, {$set: {stats: newnres}});
            }
            console.log("making the worth");
            for (r in building["prodVal"]) {
              if (r != "pollution"){
                newRes[r] = newRes[r] + building["prodVal"][r];
              }
              else {
                newPoll = newPoll + building["prodVal"]["pollution"];
              }
            }
            // }
            
          
          //********* NEW HAPPINESS CALCULATOR
          // Happiness = Wealth / {(Population/Food) + Pollution}
          // Population = (# of current available food around the city + Happiness) / {Pollution + (# of initial available food around city - # of current round)}
          //
          
          // deltaHapp = (newRes["lumber"] + newRes["clay"] + newRes["copper"]) / thisGame["population"];
          // if (deltaHapp > 0.6) { deltaHapp = Math.min(3, parseInt(deltaHapp)); }
          // else if (deltaHapp < 0.3) { deltaHapp = -1; }
          // newHapp = thisGame["happiness"] + deltaHapp;
          // newPop = thisGame["population"] + parseInt(((0.5 * newRes["food"]) - (0.5 * newPoll)  + (2 * newHapp)) / thisGame["population"]);
          
          console.log("trying to update game");
          return Games.update(
            {"_id": thisGame._id}, 
            {$set: {
              "res": newRes, 
              // "population": newPop, 
              // "happiness": newHapp, 
              "pollution": newPoll, 
              "roundEmployed": roundEmployed, 
              "running": running
            }} );
            // return true;
          }
        }
        else {
          // running = false;
          console.log(building.name + " did not run cause out of people");
          thisGame["notes"].push(building.name + " did not run cause out of people");

        }
        // wealth = 0;
        // for (s in newRes) {
        //   wealth += newRes[s];  
        // }
        

      }

      async function updateStats(gameCode) {
        gg = Games.find({$and: [{"gameCode": gameCode}, {"role": "base"}]}).fetch();
        for (g in gg) {
          thisGame = gg[g];
          newRes = thisGame["res"];
          newPoll = thisGame["pollution"]; newPop = thisGame["population"]; newHapp = thisGame["happiness"];
          console.log("what the what, employing " + thisGame["roundEmployed"]);
          newHapp = thisGame["happiness"];
          newPop = thisGame["population"];
          wealth = newRes["clay"] + newRes["lumber"] + newRes["copper"];
          pollHere = thisGame["pollution"] == 0 ? 1: newPoll;
          happFactor = ((newRes["food"] / thisGame["population"]) + wealth) / ( + pollHere);
          console.log("trying to update happiness " + thisGame["group"] + " " + happFactor);
          if (happFactor > 1) { newHapp +=  1; }
          else if (happFactor < 0.5) { newHapp -= 1; }
          
          popFactor = (newPop + newRes["food"]) / (newPop + pollHere);
          if (popFactor > 1) { newPop += 1; }
          else if (popFactor < 0.5) { if (newPop > 0) {newPop -= 1;} }  
          await Games.update(
            {"_id": thisGame._id}, 
            {$set: {
              "res": newRes, 
              "population": newPop, 
              "happiness": newHapp, 
              // "pollution": newPoll, 
              // "roundEmployed": roundEmployed, 
              // "running": running
            }
          });
        }
        
      }

      async function runThroughBuilds(buildings) {
        // gameTeams = {};

        await Games.update({$and: [{"gameCode": buildings[0].gameCode}, {"role": "base"}]}, {$set: {"roundEmployed": 0}}, {multi: true});

        for (b in buildings) {
          bb = buildings[b];

          if ("running" in bb) {
            if (bb["running"] == true) {
              // gameTeams[bb["ownerGame"]] = await EatAndMake(gameTeams[bb["ownerGame"]], bb);
              try {
                console.log("calling eat and make");
                // console.log(bb);
                await EatAndMake(bb["ownerGame"], bb);
              }
              catch (err) {
                console.log(err);
              }
              
            }
          }
          // Buildings.update({"_id": bb["_id"]}, {$set: {"running": false}});
          // console.log(bb["kind"]);
        }
        console.log("updating happiness etc");
        await updateStats(gameCode);
      }

      Games.update({$and: [{"gameCode": gameCode}, {"role": "base"}]}, {$set: {"roundEmployed": 0}}, {multi: true});
      buildings = Buildings.find({$and:[{"gameCode": gameCode}]}).fetch();
      if (buildings.length > 0){
        runThroughBuilds(buildings);
      }

      console.log("trying to update year");
      thisyear = Games.findOne({$and: [{"gameCode": gameCode}, {"role": "admin"}]});
      if ("year" in thisyear) {thisyear = thisyear.year + 1;}
      else {thisyear = 1;}
      Games.update(
        {"gameCode": gameCode}, 
        {$set: {"year": thisyear, "readyCities": [], "phase": "pre-bid", "bidCommit": false, "info": {}}},
        {multi: true});
      // console.log(Games.find({"gameCode": gameCode}).fetch());
    }
  }
});

export const BuildingNeighbors = new ValidatedMethod ({
  name: 'neighbors.build',
  validate ({}) {},
  run({gameCode, building}) { 
    neighbors = CellNeighbor.call({"gameCode": gameCode, "location": building["location"]});
    console.log(building);
    console.log("trying to add building neighbors");
    // neighborBonus
    if ("neighborBonus" in building || "neighborNeed" in building) {
      console.log("looking to add neighbors info");
      if ("neighborBonus" in building){
        nres = building["neighborBonus"]["resources"];
      }
      else if ("neighborNeed" in  building) {
        nres = building["neighborNeed"]["resources"];
      }
      for (n in neighbors) {
        if (neighbors[n] != undefined) {
          if ("resId" in neighbors[n]) {
            res = Resources.findOne({"_id": neighbors[n]["resId"]});
            console.log(res["stats"]);
            console.log(nres);
            // if (Object.keys(res["stats"]).indexOf(nres) > -1 || res["kind"] == nres) {
            if (res["kind"] == nres) { 
              console.log("ore found!");
              // add bonus resource output here;
              Buildings.update(
                {"_id": building["_id"]}, 
                {$set: {
                  "neighboringResource": res["_id"],
                  "status": ["bonus mode"]
                }
              });
            }
          }
        }
      }
    }
  }
});

// export const RemoveBuilding = new ValidatedMethod({
//   name: 'remove.build',
//   validate ({}) {},
//   run({buildId}) { 
//     Buildings.remove({"_id": buildId});
//     Maps.update({"buildingId": buildId}, {$unset: {"buildingId": ""}});
//   }
// });


function resDictToArr(dict) {
  retArr = []
  for (d in dict) {
    if (dict[d] > 0) {
      retArr.push({"res": d, "amount": dict[d], "image": resImages[d]})
    }
  }
  return retArr;
}


//mine kinds include metalmine, claymine, coppermine, etc
//farm kinds include fishfarm, 

const buildImages = {
  "claymine": "../img/buildings/claymine.png",
  "coppermine": "../img/buildings/coppermine.png",
  "foodfarm": "../img/buildings/foodfarm.png",
  "foodfishing": "../img/buildings/foodfishing.png",
  "foodhunting": "../img/buildings/foodhunting.png",
  "lumbercamp": "../img/buildings/lumbercamp.png"
}

const buildDisplayNames = {
  "claymine": "Clay Mine",
  "coppermine": "Copper Mine",
  "foodfarm": "Farm",
  "foodfishing": "Fishing Camp",
  "foodhunting": "Hunting Camp",
  "lumbercamp": "Lumber Camp",
  "background": "Empty",
  "water": "River",
  "woods": "Woods",
  "lumber": "Lumber",
  "copper": "Copper Ore",
  "clay": "Clay Ore"
}

const resImages = {
  "m1": "../img/icons/gold_sml.png",
  "f1": "../img/icons/food_sml.png",
  "m2": "../img/icons/steel_sml.png",
  "f2": "../img/icons/cotton_sml.png",
  "food": "../img/resources/food.png",
  "clay": "../img/resources/clay.png",
  "copper": "../img/resources/copper.png",
  "lumber": "../img/resources/lumber.png",
  "pollution": "../img/icons/pollution_sml.png",
  "population": "../img/icons/population_sml.png",
  "happiness": "../img/icons/happiness_sml.png"
};

const buildFeatures = {
  "claymine": { "resKind": "clay", "buildKind": "mine", "resUse": "clay"},
  "coppermine": { "resKind": "copper", "buildKind": "mine", "resUse": "copper"},
  "foodfarm": { "resKind": "food", "buildKind": "farm", "resUse": "" },
  "foodfishing": { "resKind": "food", "buildKind": "fishing", "resUse": "fish" },
  "foodhunting": { "resKind": "food", "buildKind": "hunting", "resUse": "animals" },
  "lumbercamp": { "resKind": "lumber", "buildKind": "camp", "resUse": "lumber" }
};

const prodCosts = {
  "claymine": { "lumber": 2, "clay" : 0, "copper": 0, "food": 2 },
  "coppermine": { "lumber": 2, "clay" : 0, "copper": 0, "food": 2 },
  "foodfarm": { "lumber": 1, "clay" : 1, "copper": 0, "food": 0 },
  "foodfishing": { "lumber": 0, "clay" : 0, "copper": 1, "food": 0 },
  "foodhunting": { "lumber": 0, "clay" : 0, "copper": 0, "food": 0 },
  "lumbercamp": { "lumber": 0, "clay" : 1, "copper": 0, "food": 0 }
};

const prodVals = {
  "claymine": { "clay": 5, "pollution": 2 },
  "coppermine": {"copper": 5, "pollution": 2},
  "foodfarm": {"food": 5},
  "foodfishing": {"food": 5},
  "foodhunting": {"food": 3},
  "lumbercamp": {"lumber": 8}
};

//neighborNeeds specifies requirement which restricts  placement
//neighborBonuses indicates bonusmode if neighboring resource is available
//neighborUses gets used, if neighboring resource is present. Either by neighborneed or bonus mdoe
  //bonusProds is the extra production that happens is neighborUse succeeds
//neighborAffect affects the neigboring resource


const neighborBonuses = {
 "claymine": {"resources": "clay", "buildings": []},
  "coppermine": {"resources": "copper", "buildings": []},
  "foodfarm": {"resources": "water", "buildings": []},
}
const neighborNeeds = {
  "foodfishing": {"resources": "water", "buildings": []},
  "foodhunting": {"resources": "lumber", "buildings": []},
  "lumbercamp": {"resources": "lumber", "buildings": []}
};


const neighborUses = {
  "claymine":  {"res": "clay", "amount": 2},
  "coppermine": {"res": "copper", "amount": 2},
  "foodfishing": {"res": "fish", "amount": 2},
  "foodhunting": {"res": "animals", "amount": 2},
  "lumbercamp": {"res": "lumber", "amount": 3},
  "foodfarm": {"res": "fish", "amount": 0}
};

const neighborAffects = {
  "foodfarm": {"pollution": 2}
}

const bonusProds = {
  "claymine": {"res": "clay", "amount" : 3, "pollution": 1},
  "coppermine": {"res": "copper", "amount": 3, "pollution": 1},
  "foodfarm": {"res": "food", "amount": 3}
};

const infoTexts = {
  "claymine":  "Produces: 5 clay, 2 pollution (or 8 clay and 3 pollution if ore is nearby), Uses: 2 food and 2 lumber",
  "coppermine": "Produces: 5 copper, 2 pollution (or 8 copper and 3 pollution if ore is nearby), Uses: 2 food and 2 lumber",
  "foodfarm": "Produces: 5 food (8 food and 2 water pollution, if river nearby), Uses: 1 lumber, 1 clay. ",
  "foodfishing": "Produces: 5 food, Uses: 1 copper, and 2 fish from nearby water. Can only be placed next to water.",
  "foodhunting": "Produces: 3 food, Uses: 2 animals (from the forest nearby). Needs forest nearby.",
  "lumbercamp": "Produces: 8 lumber, Uses: 1 clay, 3 lumber (from the forest nearby). Needs forest nearby."
};

const bonusTexts = {
  "claymine":  "+3 clay, +1 pollution if ore nearby",
  "coppermine": "+3 copper, +1 pollution if ore nearby",
  "foodfarm": "+3 food, 2 water pollution if river nearby",
  "foodfishing": "Also uses: 2 fish from nearby water. Can only be placed next to water.",
  "foodhunting": "Also uses: 2 animals (from the forest nearby). Needs forest nearby.",
  "lumbercamp": "Uses: 3 lumber (from the forest nearby). Needs forest nearby."
};

export const AddBuilding = new ValidatedMethod({
  name: 'add.build',
  validate ({}) {},
  run({gameCode, locx, locy, bidKind, buildingName, groupName}) {
    if (!this.isSimulation) {
 
      prodCost = prodCosts[buildingName];
      prodCostArr = resDictToArr(prodCost);
      prodVal = prodVals[buildingName];
      prodValArr = resDictToArr(prodVal);
      infoText = infoTexts[buildingName] ;
      bonusText = bonusTexts[buildingName] ;

      buildObj = {
        "gameCode": gameCode, "owned": false, "name": buildingName, 
        "bidKind": bidKind, "buildFeatures": buildFeatures[buildingName], 
        "infoText": infoText, "bonusText": bonusText,
        "running": false, "prodCost": prodCost, "prodVal": prodVal, 
        "prodCostArr": prodCostArr, "prodValArr": prodValArr,
        "state": "auction", "placed": false, "visible": true};
      
      if (buildingName in buildImages) {
        buildObj["image"] = buildImages[buildingName];
      }
      if (buildingName in buildDisplayNames) {
        buildObj["displayName"] = buildDisplayNames[buildingName];
      }
      if (buildingName in neighborNeeds) {
        buildObj["neighborNeed"] = neighborNeeds[buildingName];
      }
      if (buildingName in neighborBonuses) {
        buildObj["neighborBonus"] = neighborBonuses[buildingName];
      }
      if (buildingName in neighborUses) {
        buildObj["neighborUse"] = neighborUses[buildingName];
      }
      if (buildingName in neighborAffects) {
        buildObj["neighborAffect"] = neighborAffects[buildingName];
      }
      if (buildingName in bonusProds) {
        buildObj["bonusProd"] = bonusProds[buildingName];
      }
      

      mapPlaced = false;
      if (groupName == "auctions") {
        buildObj["auction"] = true;
      }
      else {
        gameObj = Games.findOne({$and: [{"gameCode": gameCode}, {"group": groupName}]});
        groupGame = gameObj['_id'];
        groupId = gameObj["playerId"];
        buildObj["owned"] = true;
        buildObj["owner"] = groupName;
        buildObj["ownerId"] = groupId;
        buildObj["ownerGame"] = groupGame
        buildObj["state"] = "owned";
        if (locx != -1){
          buildObj["location"] = [locx, locy];
          buildObj["state"] = "placed";
          mapPlaced = true;
        }
      }
      Buildings.insert(buildObj);
      //*** TODO: POSSIBLY FORCE building Id (and resource Id) to be epoch+gameCode+building+kind so that this find query doesn't return empty and leave buildingId undefined
      if (mapPlaced == true) {
        thisBuild = Buildings.findOne(buildObj);
        Maps.update(
          {$and: [{"x": locx}, {"y": locy}, {"gameCode": gameCode}]}, 
          {$set: {"building": thisBuild, "buildingId": thisBuild["_id"] }},
          {upsert: true}
        ); 

        BuildingNeighbors.call({"gameCode": gameCode, "building": thisBuild})
      }
      // });
      // build = Buildings.findOne()
    }
  }
});

export const PlaceBuilding = new ValidatedMethod({
  name: 'place.build',
  validate ({}) {},
  run ({gameCode, buildingId, location, userId}) {
    //if map location belongs to city
    //and location doesn't have a building
    // console.log(location);
    //place it
    mapLoc = Maps.findOne({$and: [{"gameCode": gameCode}, {"x": location[0]}, {"y": location[1]}]});
    building = Buildings.findOne({"_id": buildingId});

    if (mapLoc["ownerId"] == userId) {
      // console.log("spot is owned");
      if (building["ownerId"] == userId) {
        // console.log("building is owned");
        if ("buildingId" in mapLoc) {
          // console.log("building in spot")
          // console.log(mapLoc);
          return "there's a building in this spot!";
        }
        else {
          // console.log("trying to place building")
          building["location"] = location;
          Buildings.update({"_id": buildingId}, {$set: {"location": location}});
          Maps.update({"_id": mapLoc._id}, {$set: {"buildingId": building._id, "building": building}});
        }
      }
      else {
        return "you don't own this building!";
      } 
    }
    else {
      return "you don't own this spot!!!";
    }
    console.log("setting up building neighbors");
    BuildingNeighbors.call({"gameCode": gameCode, "building": building});
    
  }
});

export const CellNeighbor = new ValidatedMethod({
  name: 'map.neighbor',
  validate ({}) {},
  run({gameCode, location}) {
    x = location[0];
    y = location[1];
    neighbors = [];
    neighborCoords = [
      [(x - 1), y], [(x + 1), y], [x, (y - 1)], [x, (y + 1)]
    ];
    for (n in neighborCoords) {
      neigh = Maps.findOne({$and: [{"gameCode": gameCode}, {"x": neighborCoords[n][0]}, {"y": neighborCoords[n][1]}]});
      neighbors.push(neigh);
    }
    return neighbors;
  }
});

export const ResetResources = new ValidatedMethod({
  name: 'resources.reset',
  validate ({}) {},
  run({gameCode}) {
    Resources.remove({"gameCode": gameCode});
    Maps.update({"gameCode": gameCode}, {$unset: {"resource": "", "resId": ""}});
  }
})

export const ResetTeamResources = new ValidatedMethod({
  name: 'teamresources.reset',
  validate ({}) {},
  run({gameCode}) {
    newres = {"lumber": 8, "clay": 8, "copper": 8, "food": 8};
    Games.update(
      {$and: [{"gameCode": gameCode}, {"role": "base"}]},
      {$set: {"res": newres, 
        "pollution": 2, "population": 5, "happiness": 5, "roundEmployed": 0}},
      {multi: true});
    Games.update(
      {$and: [{"gameCode": gameCode}]},
      {$set: {"year": 1, "phase": "pre-bid"}},
      {multi: true}
    );
  }
})

export const ResetMap = new ValidatedMethod({
  name: 'map.reset',
  validate ({}) {},
  run({gameCode}) {
    Resources.remove({"gameCode": gameCode});
    Maps.remove({"gameCode": gameCode});
  }
})

export const RemoveBuilding = new ValidatedMethod({
  name: 'remove.build',
  validate ({}) {},
  run({gameCode = "", buildingId}) {
    console.log("removing building ");
    Buildings.remove({"_id": buildingId});
    Maps.update(
      // {$and: [{"gameCode": gameCode}, {"buildingId": buildingId}]}, 
      {$and: [{"buildingId": buildingId}]}, 
      {$unset: {"building": "", "buildingId": ""}
    });
  }
})

export const RemoveBuilds = new ValidatedMethod({
  name: 'removeAll.build',
  validate ({}) {},
  run({gameCode}) {
    Buildings.remove({"gameCode": gameCode});
    Maps.update({"gameCode": gameCode}, {$unset: {"building": "", "buildingId": ""}}, {multi: true});
  }
})

export const SetTheme = new ValidatedMethod({
  name: 'map.theme',
  validate({}) {},
  run({gameCode}) {
    mapTiles = {
      "claymine": "../img/buildings/claymine.png",
      "coppermine": "../img/buildings/coppermine.png",
      "foodfarm": "../img/buildings/foodfarm.png",
      "foodfishing": "../img/buildings/foodfishing.png",
      "foodhunting": "../img/buildings/foodhunting.png",
      "lumbercamp": "../img/buildings/lumbercamp.png",
      "background": "../img/resources/grass.png",
      "water": "../img/resources/river.png",
      "woods": "../img/resources/woods.png",
      "lumber": "../img/resources/woods.png",
      "copper": "../img/resources/copperore.png",
      "clay": "../img/resources/clayore.png",
      "red-city": "../img/bg/red-city.png",
      "yellow-city": "../img/bg/yellow-city.png",
      "blue-city": "../img/bg/blue-city.png",
      "green-city": "../img/bg/green-city.png",
      "pink-city": "../img/bg/pink-city.png",
      
    }
    Games.update({"gameCode": gameCode}, {$set: {"mapTiles": mapTiles}}, {multi: true});
  }
});

export const MakeMap = new ValidatedMethod({
  name: 'map.make',
  validate ({}) {},
  run({gameCode}) {
  if (!this.isSimulation) {
    /*
    first assign ownership of cells for the first four teams - four corners of the grid - 0,0; 13,0; 0,13; 13,13
        edit - going by current map, it's five teams at 1,1; 9,0; 12,6; 12, 12; 2, 12

    then add 2 ores (m1, m2), and 1 resource (f1) in each team's grid.
    
    add some ores and a river in no man's land.

    add 4 2x2 ores, and 1 river through the map

    */


    async function seedResources (gameCode) {
      resLocs = {
        "woods1": [[0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], 
        [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], 
        [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11]],
        "woods2": [ [12, 4], [12, 5],
        [13, 0], [13, 1], [13, 2], [13, 3], [13, 4], [13, 5], 
        [14, 0], [14, 1], [14, 2], [14, 3], [14, 4], [14, 5], 
        [15, 0], [15, 1], [15, 2], [15, 3], [15, 4], [15, 5] ],
        "lake": [ [7, 0], [8, 0], [7, 1], [8, 1], [6, 2], [7, 2], [6, 3], [7, 3], [6, 4], [7, 4], [6, 5], [7, 5], [5, 6], [6, 6], [5, 7], [6, 7], [5, 8], [6, 8], [5, 9], [6, 9], [5, 10], [6, 10], [5, 11], [6, 11],
        [6, 12], [6, 13], [7, 12], [7, 13], [8, 12], [8, 13], [9, 12], [9, 13], [10, 12], [10, 13], [11, 12], [11, 13], 
        [10, 14], [11, 14], [10, 15], [11, 15]
        ],
        "mine1": [[3, 5], [4, 5], [3, 6], [4, 6]],
        "mine2": [[14, 10], [14, 11], [15, 10], [15, 11]]
      };
      resAmounts = {
        "woods1": {"lumber": 100, "animals": 30},
        "woods2": {"lumber": 100, "animals": 30},
        "lake": {"pollution": 0, "fish": 50},
        "mine1": {"clay": 30},
        "mine2": {"copper": 30}
      }

      resKinds = {
        "woods1": "lumber",
        "woods2": "lumber",
        "lake": "water",
        "mine1": "clay",
        "mine2": "copper"
      }

      teams = await Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]});
      teams = teams.fetch();

      for (res in resLocs) {
        resObj = {"gameCode": gameCode, "name": res, "kind": resKinds[res], "stats": resAmounts[res], "locations": resLocs[res]};
        await Resources.insert(resObj);
        thisRes = await Resources.findOne(resObj);
        for (l in resLocs[res]) {
          console.log(thisRes._id);
          await Maps.update (
            {$and: [{"x": resLocs[res][l][0]}, {"y": resLocs[res][l][1]}, {"gameCode": gameCode}]}, 
            {$set: {"resource": thisRes, "resId": thisRes["_id"]}}, 
            {upsert: true});
        }

      }
      
    }

    async function makeTeamCells (corner, dims, gameCode, groupId, groupName, groupGame) {
      //groupID is the userID of the group's user object; and groupGame is the _id of the group's game object. 
      //all instances of orange group across games are the same user but different games
      var thisX = corner[0];
      var thisY = corner[1];
      var width = dims[0];
      var height = dims[1];
      var endX = thisX + width;
      var endY = thisY + height;
      console.log(thisX + " " + thisY + " " + endX + " " + endY);

      for (thisX; thisX < endX; thisX += 1){
        for (thisY = corner[1]; thisY < endY; thisY += 1) {
          console.log(thisX + " " + thisY);
          // mapid = "";
          // mapobj = await Maps.findOne({$and: [{"x": thisX}, {"y": thisY}, {"gameCode": gameCode}]})
          // if (mapobj != undefined){
            // mapid = mapobj._id;
          // }
          // await Maps.update(
          await Maps.update(
            {$and: [{"x": thisX}, {"y": thisY}, {"gameCode": gameCode}]}, 
            {$set: {"owner": groupName, "ownerId": groupId, "ownerGame": groupGame}}, 
            {upsert: true}
          );
        }
        console.log(thisX);
      }
      return true;

    }

    async function mapSetup(gameCode) {
      corners = [[1, 1], [9, 0], [12, 6], [12, 12], [2, 12]];
      dims = [[4, 4], [4, 4], [4, 4], [4, 4], [4, 4]];
      mapDims = [16, 16];
      visCorners = [[0, 0], [8, 0], [11, 5], [11, 11], [1, 11]];
      visDims = [[6, 6], [6, 5], [5, 6], [5, 5], [6, 5]];
      teams = await Games.find({$and: [{"role": "base"}, {"gameCode": gameCode}]}).fetch();
      // teams = teams.fetch();
      for (t in teams) {
        if (t < corners.length){
          await makeTeamCells(corners[t], dims[t], gameCode, teams[t]["playerId"], teams[t]["group"], teams[t]["_id"]);
        }
        await Games.update(
          {"_id": teams[t]["_id"]}, 
          {$set: {"visibleCorner": visCorners[t], "visibleDimensions": visDims[t]} }
        );
      }

      await Games.update({$and: [{"role": "admin"}, {"gameCode": gameCode}]}, 
        {$set: {"visibleCorner": mapDims[0], "visibleDimensions": mapDims[1]} 
      });
        


      await seedResources (gameCode);
      // SetTheme.call({"gameCode": gameCode});
    }

    mapSetup(gameCode);
    SetTheme.call({"gameCode": gameCode});
    

    //place an ore
    // Resources.insert({"gameCode": gameCode, "category": "ore", "kind": "m1", "name": "Gold Ore"});

    //
  }
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
        "year": year,
        "phase": "pre-bid",
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
        JoinGame.call({"playerName": baseList[i], "playerId": Meteor.users.findOne({"profile.name": baseList[i]})._id, "gameCode": newgc, "role": "base", "year": year, "neighbors": neighbors}, (err, res) => {
          if (err) {
            console.log(err);
            return err;
          }
          else {
            return res;
          }
        });
      }
      //call make map
      MakeMap.call({"gameCode": newgc});
      //call reset team resources
      ResetTeamResources.call({"gameCode": newgc});
      //
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
  run({playerName, playerId, gameCode, role, year = 0, neighbors = []}) {
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
          "readyCities": []  
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
          // deets["res"] = {"m1": 2, "m2": 2, "f1": 2, "f2": 2};
          deets["res"] = {"lumber": 2, "clay": 2, "copper": 2, "food": 2}
          deets["pollution"] = 0;
          deets["population"] = 5;
          deets["happiness"] = 5;
          deets["neighbors"] = neighbors;
          deets["bidCommit"] = false;
        }

        deets["group"] = group;
        deets["year"] = year;

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

export const BuildingToAuction = new ValidatedMethod({
  name: 'bid.add',
  validate ({}) {},
  run({gameCode}) {
    bidKinds = ["clay", "copper", "food", "lumber"];
    randomBk = bidKinds[Math.floor(Math.random() * bidKinds.length)];
    buildNames = ["claymine", "coppermine", "foodfarm", "foodfishing", "foodhunting", "lumbercamp"];
    randomBuild = buildNames[Math.floor(Math.random() * buildNames.length)];
    AddBuilding.call({"gameCode": gameCode, "locx": -1, "locy": 0, "bidKind": randomBk, "buildingName": randomBuild, "groupName": "auctions"});
    // run({gameCode, locx, locy, bidKind, buildingName, groupName}) {
  }
});

export const MakeBid2 = new ValidatedMethod({
  name: 'bid2.make',
  validate({}) {},
  run({baseId, building, gameCode, oldVal, newVal, change, bidKind}) {
    if (!this.isSimulation) {
      Bids.update(
        {$and: [{"baseId": baseId}, {"buildingId": building}]}, 
        {$set: {"gameCode": gameCode, "bidVal": newVal, "bidKind": bidKind}}, 
        {upsert: true})
 
      logObj = {
        "baseId": baseId,
        "buildingId": building,
        "gameCode": gameCode,
        "change": change,
        "oldVal": oldVal,
        "newVal": newVal,
        "bidKind": bidKind
      };
      MakeLog.call({"key": "BidAct", "log": logObj}, function (err, res) {
        if (err) {console.log(err);}
      });
    }
  }
});

//THIS IS THE OLD ONE

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
