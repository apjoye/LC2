import './admin.html';
import '../gameList/gameList.js';
import { Producers } from '/imports/api/links/links.js';
// import { Assets } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var'

import { ChangeStat } from '/imports/api/links/methods.js';
import { NewRound } from '/imports/api/links/methods.js';
import { StartGame } from '/imports/api/links/methods.js';
import { ToggleGameRunning } from '/imports/api/links/methods.js';
import { ChangeTeam } from '/imports/api/links/methods.js';
import { MakeBase } from '/imports/api/links/methods.js';
import { AddNeighbor } from '/imports/api/links/methods.js';
import { AddBuilding } from '/imports/api/links/methods.js';

import { RunBids } from '/imports/api/links/methods.js';
import { ConsumeResources } from '/imports/api/links/methods.js';
import { SpawnFactories } from '/imports/api/links/methods.js';

import { MakeMap } from '/imports/api/links/methods.js';
import { RunBuildings } from '/imports/api/links/methods.js';
import { ToggleBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilds } from '/imports/api/links/methods.js';
import { ResetResources } from '/imports/api/links/methods.js';
import { AsyncTest } from '/imports/api/links/methods.js';
// import {}
import { Maps } from '/imports/api/links/links.js';
import { Resources } from '/imports/api/links/links.js';
import { Buildings } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';



Template.adminView.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minepaused');
});

Template.adminView.helpers({
});

Template.adminView.events({
  'submit .hostGame': function(event) {
    event.preventDefault();
    size = event.target.groups.value;
    if (size == ""){
      size = 4;
    }
    // console.log(size);
    // cityCount, adminId, adminUsername
    StartGame.call({"adminId": Meteor.userId(), "adminUsername": Meteor.user().profile.name, "cityCount": size}, (err, res) => {
      if(err) {console.log(err);}
    });
  }
});

Template.makeGame.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minepaused');
});

Template.makeGame.helpers({
  pausedGames() {
    // console.log("trying paused");
    // console.log(Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "paused"}]}));
    return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "paused"}]});
  }
});

Template.gameMap.onCreated(function helloOnCreated() {
  Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.thisGame', FlowRouter.getParam('gameCode'));
});

Template.gameMap.helpers({
  mapRows() {
    //store map dimensions somewhere
    mapWidth = 16;    //number of columns
    mapHeight = 16;   //number of rows
    rows = [];
    map = Maps.find({"gameCode": gameCode}).fetch();
    resources = Resources.find({"gameCode": gameCode}).fetch();
    buildings = Buildings.find({"gameCode": gameCode}).fetch();
    // console.log(resources);
    resMapDict = {};
    resDict = {};
    buildDict = {};

    for (r in resources) {
      resDict[resources[r]["_id"]] = resources[r];
    }
    for (b in buildings) {
      buildDict[buildings[b]["_id"]] = buildings[b];
    }
    // console.log(resDict);
    for (m in map) {
      // if ("resource" in map[m]){
      loc = "x" + map[m].x + "y" + map[m].y;
      resMapDict[loc] = map[m];
      if ("buildingId" in map[m]) {
        // console.log(loc);
        // console.log(map[m]);
        if (map[m]["buildingId"] in buildDict){
          resMapDict[loc]["building"] = buildDict[map[m]["buildingId"]];
        }
      }
      if ("resId" in map[m]) {
        if (map[m]["resId"] in resDict){
          resMapDict[loc]["resource"] = resDict[map[m]["resId"]];
        }
      }
      // }
    }

    
    Template.instance().data["map"] = resMapDict;
    // console.log(resMapDict)
    // console.log(resMapDict);

    //add buildings, ownership, and resources stats to each cell
    for (var i = 0; i < mapHeight; i++) {
      thisRow = [];
      for (var j = 0; j < mapHeight; j++) {
        loc = "x" + j + "y" + i;
        if (loc in resMapDict) {
          // console.log(loc + " found!");
          // thisRow.push({"rowCol": resMapDict[loc]});  
          rowCol = {};
          rowCol["loc"] = loc;
          rowCol["attributes"] = "";
          if ("owner" in resMapDict[loc]) {
            rowCol["attributes"] = "bgColor = \"red\"";
          }
          rowCol["text"] = "";
          if ("resource" in resMapDict[loc]) {
            // console.log(resMapDict[loc]);
            // console.log(resMapDict[loc]["resource"]);
            rowCol["text"] = JSON.stringify(resMapDict[loc]["resource"]["stats"]);
          }
          if ("building" in resMapDict[loc]) {
            console.log(resMapDict[loc]["building"]["kind"]);
            rowCol["text"] += JSON.stringify(resMapDict[loc]["building"]["kind"]);
            
            if ("bonusResource" in resMapDict[loc]["building"]) {
              rowCol["text"] += " bonus ore! ";
            }
            
            if (resMapDict[loc]["building"]["running"] == true) {
              rowCol["text"] += " running ";
              // console.log("building is running");
            }
            else {
              rowCol["text"] += " idle ";
              // console.log("building is idle");
            }
          }
          if ("owner" in resMapDict[loc]) {
            rowCol["text"] += JSON.stringify(resMapDict[loc]["owner"]);
          }
          thisRow.push(rowCol);
          // thisRow.push(
          //   "rowCol": {
          //     "stats": JSON.stringify(resValDict[resMapDict[loc]]),
          //     "res": resMapDict[loc]
          //   });  
        }
        else {
          thisRow.push({"rowCol": ""});
        }
        
      }
      rows.push(thisRow);
    }
    // console.log(rows);
    return rows;
  }
});

Template.gameMap.events({
  'click .mapCell' (event, instance) {
    event.preventDefault();
    // console.log(event.target.id);
    console.log(Template.instance().data.map[event.target.id]);
    if (Template.instance().data.map[event.target.id] != undefined) {
      if ("building" in Template.instance().data.map[event.target.id]) {
        bb = Template.instance().data.map[event.target.id]["building"];
        ToggleBuilding.call({"buildingId": bb["_id"], "currentStatus": bb["running"], "gameCode": bb["gameCode"], "ownerId": bb["ownerId"]});
      }
    }
    
  }
});

Template.adminGame.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minerunning');
});

Template.adminGame.helpers({
  allPlayers() {
    disgame = Games.findOne({"gameCode": FlowRouter.getParam("gameCode")});
    // console.log( disgame.groupList);
    return disgame.groupList;
  },

  gameResource() {
    return ["res.m1", "res.m2", "res.f1", "res.f2", "pollution", "population", "happiness"];
  },

  status() {
    return Games.findOne({"gameCode": FlowRouter.getParam("gameCode")}).status;
  },

  gamePlayers() {
    return Games.find({$and: [{"role": "player"}, {"gameCode": FlowRouter.getParam("gameCode")}]});
  },

  gameTeams() {
    return Games.find({$and: [{"role": "base"}, {"gameCode": FlowRouter.getParam("gameCode")}]});
  },

  gamePhaseClass() {
    phase = Games.findOne({"gameCode": FlowRouter.getParam("gameCode")}).phase;
    if (phase == "post-bid") {
      return {"bids": "btn-warning", "builds": "btn-primary"};
    }
    else {
      return {"bids": "btn-primary", "builds": "btn-warning"};
    }
  },

  buildingNames() {
    return ["claymine", "coppermine", "foodfarm", "foodfishing", "foodhunting", "lumbercamp"];
  }
});

Template.adminGame.events({
  'submit .changeStat' (event, instance) {
    event.preventDefault();
    console.log(event.target.amount.value);
    console.log(event.target.resource.name);
    console.log(event.target.resource.value);

    ChangeStat.call({"gameCode": FlowRouter.getParam("gameCode"), "group": event.target.resource.name, "resource": event.target.resource.value, "amount": event.target.amount.value});
  },

  'submit .changeTeam' (event, instance) {
    event.preventDefault();
    console.log(event.target.team.value);
    ChangeTeam.call({"gameCode": FlowRouter.getParam("gameCode"), "player": event.target.player.value, "group": event.target.team.value});
  },

  'submit .makeBase' (event, instance) {
    event.preventDefault();
    console.log(event.target.playerName.value);
    MakeBase.call({"gameCode": FlowRouter.getParam("gameCode"), "playerName": event.target.playerName.value});
  },

  'submit .setNeighbors' (event, instance) {
    event.preventDefault();
    AddNeighbor.call({"gameCode": FlowRouter.getParam("gameCode"), "cityName": event.target.cityName.value, "neighbor": event.target.neighborName.value});
  },

  'submit .addBuilding' (event, instance) {
    event.preventDefault();
    if (event.target.x.value != "" && event.target.x.value != ""){
      console.log(event.target.x.value + " " + event.target.y.value + event.target.bidKind.value + event.target.buildingName.value + event.target.groupName.value);
      if (event.target.x.value >= -1 && event.target.y.value >= 0) {
        AddBuilding.call({"gameCode": FlowRouter.getParam("gameCode"), "locx": parseInt(event.target.x.value), "locy": parseInt(event.target.y.value), "bidKind": event.target.bidKind.value, "buildingName": event.target.buildingName.value, "groupName": event.target.groupName.value});    
      }
    }
    else {
      console.log(event.target.x.value + " " + event.target.y.value + "broken locs");
    }
    
  },

  'submit .addFacts' (event, instance) {
    event.preventDefault();
    facts = event.target.amount.value;
    if (facts == "") {
      facts = -1;
    }
    SpawnFactories.call({"gameCode": FlowRouter.getParam("gameCode"), "producerCount": facts});
  },

  'submit .newCustomRound' (event, instance) {
    event.preventDefault();
    console.log(event.target.amount.value);
    facts = event.target.amount.value;
    if (facts == "") {
      facts = -1;
    }
    NewRound.call({"gameCode": FlowRouter.getParam("gameCode"), "producerCount": facts});

  },

  'click .reset' (event, instance) {
    ResetAll.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
    });
  },

  'click .runBids'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    RunBids.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("bids run!");
      }
    })
  },

  'click .runBuilds'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    // ConsumeResources.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
    //   if (err) {console.log(err);}
    //   else {
    //     console.log("bids run!");
    //   }
    // });
  },

  'click .asyncTest'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    AsyncTest.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("round run!");
      }
    })
  },

  'click .resetRes'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    ResetResources.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("resources reset!");
      }
    })
  },

  'click .makeMap'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    MakeMap.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("map made!");
      }
    })
  },

  'click .runBuildings'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    RunBuildings.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("buildings run!");
      }
    })
  },

  'click .removeBuildings'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    RemoveBuilds.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("removing all buildings!");
      }
    });
  },

  'click .newRound'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    NewRound.call({"gameCode": FlowRouter.getParam("gameCode")}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("round run!");
      }
    })
  },

  'click .seeScore' (event, instance) {
    FlowRouter.go('App.scoreboard', {gameCode: FlowRouter.getParam("gameCode")});
  },

  'click .toggleGameState' (event, instance) {
    // var status = instance;
    var status = Games.findOne({"gameCode": FlowRouter.getParam("gameCode")}).status;
    // console.log(status);
    ToggleGameRunning.call({"gameCode": FlowRouter.getParam("gameCode"), "currentState": status});
  }
});