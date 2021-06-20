import './admin.html';
import '../gameList/gameList.js';
// import '../map/map.js';
import { Producers } from '/imports/api/links/links.js';
// import { Assets } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var'

import { ChangeStat } from '/imports/api/links/methods.js';
import { ChangeResource } from '/imports/api/links/methods.js';
import { ChangePassword } from '/imports/api/links/methods.js';
import { NewRound } from '/imports/api/links/methods.js';
import { StartGame } from '/imports/api/links/methods.js';
import { ToggleGameRunning } from '/imports/api/links/methods.js';
import { ChangeTeam } from '/imports/api/links/methods.js';
import { MakeBase } from '/imports/api/links/methods.js';
import { AddNeighbor } from '/imports/api/links/methods.js';
import { AddBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilding } from '/imports/api/links/methods.js';

import { RunBids } from '/imports/api/links/methods.js';
import { ConsumeResources } from '/imports/api/links/methods.js';
import { SpawnFactories } from '/imports/api/links/methods.js';

import { MakeMap } from '/imports/api/links/methods.js';
import { RefreshReplenishments } from '/imports/api/links/methods.js';
import { BuildingToAuction } from '/imports/api/links/methods.js';
import { RunBids2 } from '/imports/api/links/methods.js';
import { RunBuildings } from '/imports/api/links/methods.js';
import { ToggleBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilds } from '/imports/api/links/methods.js';
import { ResetResources } from '/imports/api/links/methods.js';
import { ResetTeamResources } from '/imports/api/links/methods.js';
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
      size = 5;
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
  Meteor.subscribe('games.users',  FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.thisGame', FlowRouter.getParam('gameCode'));
  this.imageMode = new ReactiveVar(true);
  this.topMargin = new ReactiveVar(420);
});

Template.gameMap.helpers({
  mapRows() {
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
    bgColors = {
      "red-city": "rgba(255,0,0,0.6)",
      "yellow-city": "rgba(255,255,0,0.3)",
      "blue-city": "rgba(0,0,255,0.3)",
      "green-city": "rgba(0,255,0,0.3)",
      "pink-city": "rgba(255, 51, 153, 0.3)",
    }
    isometricTiles = {
      
    }
    // highLightColors = {
    //   "red-city": "rgba(255,0,0,0.6)",
    //   "yellow-city": "rgba(255,255,0,0.3)",
    //   "blue-city": "rgba(0,0,255,0.3)",
    //   "green-city": "rgba(0,255,0,0.3)",
    //   "pink-city": "rgba(255, 51, 153, 0.3)",
    // }
    //store map dimensions somewhere
    mapWidth = 16;    //number of columns
    mapHeight = 16;   //number of rows
    rows = [];
    map = Maps.find({"gameCode": gameCode}).fetch();
    resources = Resources.find({"gameCode": gameCode}).fetch();
    buildings = Buildings.find({$and: [{"gameCode": gameCode}]}).fetch();
    // buildings = Buildings.find({$and: [{"gameCode": gameCode}, {"owner": Meteor.userId()}]}).fetch();
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
    for (var i = 0; i < mapWidth; i++) {
      thisRow = [];
      for (var j = 0; j < mapHeight; j++) {
        loc = "x" + j + "y" + i;
        rowCol = {};
        rowCol["image"] = mapTiles["background"];
        rowCol["text"] = "";
        rowCol["bgColor"] = "";
        rowCol["loc"] = loc;

        if (loc in resMapDict) {
          // console.log(loc + " found!");
          // thisRow.push({"rowCol": resMapDict[loc]});  
          // rowCol = {};
          rowCol["loc"] = loc;
          
          if ("owner" in resMapDict[loc]) {
            rowCol["image"] = "../img/bg/empty.png";
            // rowCol["attributes"] = "bgColor = \"red\"";
            rowCol["bgColor"] = bgColors[resMapDict[loc]["owner"]];
            // console.log(resMapDict[loc]["owner"]);
            // console.log(bgColors);
            // console.log(rowCol["bgColor"]);
          }
          rowCol["text"] = "";
          if ("resource" in resMapDict[loc]) {
            // console.log(resMapDict[loc]);
            // console.log(resMapDict[loc]["resource"]);
            rowCol["image"] = mapTiles[resMapDict[loc]["resource"]["kind"]];
            rowCol["text"] = JSON.stringify(resMapDict[loc]["resource"]["stats"]);
          }
          if ("building" in resMapDict[loc]) {
            if (resMapDict[loc]["building"]["ownerId"] == Meteor.userId()){
              rowCol["image"] = mapTiles[resMapDict[loc]["building"]["name"]];
            }
              rowCol["text"] += JSON.stringify(resMapDict[loc]["building"]["buildFeatures"]["resKind"]);
              
              if ("neighboringResource" in resMapDict[loc]["building"]) {
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
          thisRow.push(rowCol);
        }
        
      }
      rows.push(thisRow);
    }
    // console.log(rows);
    return rows;
  },

  cityStats() {
    topMargin = Template.instance().topMargin.get();
    cities = Games.find({$and: [{"role": "base"}, {"gameCode": FlowRouter.getParam('gameCode')}]}).fetch();
    stats = [];
    // console.log(cities);
    cityLocs = {
      "red-city": {"x": 71, "y": 207},
      "green-city": {"x": 562, "y": 158},
      "pink-city": {"x": 746, "y": 518},
      "blue-city": {"x": 752, "y": 890},
      "yellow-city": {"x": 128, "y": 890},
    };
    for (c in cities) {
      // loc = "cell-x" + cities[c]["visibleCorner"][0] + "y" + cities[c]["visibleCorner"][1];
      // xloc = 80 + (60 * cities[c]["visibleCorner"][0]);
      // yloc = topMargin + 200 + (62 * cities[c]["visibleCorner"][1]);
      // if (cities[c]["playerName"] == "green-city") {
      //   yloc -= 50;
      // }
      // if (cities[c]["playerName"] == "blue-city" || cities[c]["playerName"] == "pink-city") {
      //   xloc += 20;
      // }
      // console.log(xloc + " " + yloc);
      xloc = Object.values(cityLocs)[c]["x"];
      yloc = topMargin + Object.values(cityLocs)[c]["y"];

      cities[c]["className"] = cities[c]["group"] + "-status";
      cities[c]["style"] = "top:" + yloc + "px; left:" + xloc + "px";
      res = cities[c]["res"];
      cities[c]["wealth"] = res["lumber"] + res["food"] + res["clay"] + res["copper"]
      stats.push(cities[c]);
    }
    return stats;
  },

  resStats() {
    topMargin = Template.instance().topMargin.get();
    resourceMapImg = {
      "clay": "../img/resources/clay.png",
      "copper": "../img/resources/copper.png",
      "lumber": "../img/map/res_status/treeresource.png",
      "animals": "../img/map/res_status/deer.png",
      "pollution": "../img/map/city_status/pollution.png",
      "fish": "../img/map/res_status/fish.png",
    }
    res = Resources.find({"gameCode": FlowRouter.getParam('gameCode')}).fetch();
    stats = [];
    
    leftMargin = 20;
    locs = {
      "woods1": {"x": 10, "y": 300},
      "lake": {"x": 310, "y": 360},
      "woods2": {"x": 870, "y": 100},
      "mine1": {"x": 160, "y": 260},
      "mine2": {"x": 870, "y": 600},
    }
    for (r in res) {
      res[r]["className"] = res[r]["name"] + "-status";
      // console.log(res[r]["name"])
      res[r]["locStyle"] = "top:" + (topMargin + locs[res[r]["name"]]["y"]) + "px; left: " + (leftMargin + locs[res[r]["name"]]["x"]) + "px;";
      res[r]["statList"] = [];
      for (s in res[r]["stats"]) {
        resObj = {"name": s, "amount": res[r]["stats"][s], "img": resourceMapImg[s]};
        if (["lumber", "water"].indexOf(res[r].kind) > -1) {
          if (s in res[r]["replenishFactors"]) {
            resObj["replenish"] = true;
            resObj["replenishAmount"] = res[r]["replenishFactors"][s];
          }
         }
        res[r]["statList"].push(resObj);
      }
      stats.push(res[r]);
    }
    return stats;
  },

  imageMode() {
    return Template.instance().imageMode.get();
  }
});

Template.gameMap.events({
  'click .mapCell' (event, instance) {
    event.preventDefault();
    // console.log(event.target.id);
    loc = event.target.classList[2];
    console.log(Template.instance().data.map[loc]);
    if (Template.instance().data.map[loc] != undefined) {
      if ("building" in Template.instance().data.map[loc]) {
        bb = Template.instance().data.map[event.target.id]["building"];
        ToggleBuilding.call({"buildingId": bb["_id"], "currentStatus": bb["running"], "gameCode": bb["gameCode"], "ownerId": bb["ownerId"]});
      }
    }
  },

  'click .toggleImages' (event, instance) {
    console.log(Template.instance().imageMode.get());
    Template.instance().imageMode.set(!Template.instance().imageMode.get());
  },

  'submit .setTopMargin'(event, instance) {
    event.preventDefault();
    mv = parseInt(event.target.marginValue.value);
    console.log(mv);
    Template.instance().topMargin.set(mv);
  }

});

Template.adminGame.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.users', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  this.gameCode = new ReactiveVar(FlowRouter.getParam("gameCode"));
  // Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  // Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  // Meteor.subscribe('buildings.thisGame', FlowRouter.getParam('gameCode'));
});

Template.adminGame.helpers({
  allBases() {
    // disgame = Games.findOne({"gameCode": FlowRouter.getParam("gameCode")});
    disgame = Games.findOne({"gameCode": Template.instance().gameCode.get()});
    // console.log( disgame.groupList);
    return disgame.groupList;
  },
  allPlayers() {
    players = Games.find({"gameCode": Template.instance().gameCode.get()});
    // console.log( disgame.groupList);
    // console.log(players);
    return players;
  },
  gameResource() {
    return ["res.clay", "res.copper", "res.lumber", "res.food", "pollution", "population", "happiness"];
    // return ["res.m1", "res.m2", "res.f1", "res.f2", "pollution", "population", "happiness"];
  },

  committedBids() {
    return Games.find({$and: [{"gameCode": Template.instance().gameCode.get()}, {"bidCommit": true}]});
  },

  status() {
    return Games.findOne({"gameCode": Template.instance().gameCode.get()}).status;
  },

  gamePlayers() {
    return Games.find({$and: [{"role": "player"}, {"gameCode": Template.instance().gameCode.get()}]});
  },

  gameTeams() {
    return Games.find({$and: [{"role": "base"}, {"gameCode": Template.instance().gameCode.get()}]});
  },

  gamePhaseClass() {
    phase = Games.findOne({"gameCode": Template.instance().gameCode.get()}).phase;
    if (phase == "post-bid") {
      return {"bids": "btn-warning", "builds": "btn-primary"};
    }
    else {
      return {"bids": "btn-primary", "builds": "btn-warning"};
    }
  },
  
  presentBuildings() {
    builds = Buildings.find({$and: [{"gameCode": Template.instance().gameCode.get()}]}).fetch();
    bb = [];
    for (b in builds) {
      // console.log("location" in builds[b]);
      if (!("location" in builds[b])) {
        // console.log("adding location");
        builds[b]["location"] = " ";
      }
      if (!("owner" in builds[b])) {
        builds[b]["owner"] = " ";
      }
      // console.log(builds[b]["_id"])
      // console.log(builds[b]["location"])
      // console.log(builds[b]["owner"])
      // console.log(builds[b]["name"])
    }


    return builds;
  },

  bidKinds() {
    return ["clay", "copper", "food", "lumber"];
  },

  buildingNames() {
    return ["claymine", "coppermine", "foodfarm", "foodfishing", "foodhunting", "lumbercamp"];
  },

  resourceList() {
    //TODO: generate this dictionary from resources.find({"gameCode": gameCode});
    res = Resources.find({"gameCode": Template.instance().gameCode.get()}).fetch();
    rl = [];
    for (r in res) {
      for (s in res[r]["stats"]) {
        rlObj = {}
        rlObj["id"] = res[r]["name"] + "-stats-" + s;
        rl.push(rlObj);
      }
      for (s in res[r]["replenishFactors"]) {
        rlObj = {}
        rlObj["id"] = res[r]["name"] + "-replenish-" + s;
        rl.push(rlObj);
      }
    }
    return rl;
  }
});

Template.adminGame.events({
  'submit .changeStat' (event, instance) {
    event.preventDefault();
    // console.log(event.target)
    // console.log(event.target.amount.value);
    // console.log(event.target.group.value);
    // console.log(event.target.resource.value);

    ChangeStat.call({"gameCode": Template.instance().gameCode.get(), "group": event.target.group.value, "resource": event.target.resource.value, "amount": parseInt(event.target.amount.value)});
  },

  'submit .changeStat' (event, instance) {
    event.preventDefault();
    // console.log(event.target)
    // console.log(event.target.amount.value);
    // console.log(event.target.group.value);
    // console.log(event.target.resource.value);
    //get reosurce name and kind
    ChangeStat.call({"gameCode": Template.instance().gameCode.get(), "group": event.target.group.value, "resource": event.target.resource.value, "amount": parseInt(event.target.amount.value)});
  },

  'submit .changePassword' (event, instance) {
    event.preventDefault();
    pn = event.target.playerName;
    playerId = pn[pn.selectedIndex].id;
    np = event.target.newPassword.value;
    if (np.length > 2){
      ChangePassword.call({"playerId": playerId, "newPassword": event.target.newPassword.value});
    }
  },

  'submit .setMapResources' (event, instance) {
    event.preventDefault();
    pn = event.target.resSelect;
    rid = pn[pn.selectedIndex].id;
    rl = rid.split("-");
    // console.log(rl);
    val = event.target.resValue.value;
    console.log(val);
    if (val){
      ChangeResource.call({"gameCode": Template.instance().gameCode.get(), "name": rl[0], "kind": rl[2], "type": rl[1], "value": parseInt(val)});
    }
    // ResourceValue.call({"playerId": playerId, "newPassword": event.target.newPassword.value});
  },

  'submit .changeTeam' (event, instance) {
    event.preventDefault();
    console.log(event.target.team.value);
    ChangeTeam.call({"gameCode": Template.instance().gameCode.get(), "player": event.target.player.value, "group": event.target.team.value});
  },

  'submit .makeBase' (event, instance) {
    event.preventDefault();
    console.log(event.target.playerName.value);
    MakeBase.call({"gameCode": Template.instance().gameCode.get(), "playerName": event.target.playerName.value});
  },

  'submit .setNeighbors' (event, instance) {
    event.preventDefault();
    AddNeighbor.call({"gameCode": Template.instance().gameCode.get(), "cityName": event.target.cityName.value, "neighbor": event.target.neighborName.value});
  },

  'submit .addBuilding' (event, instance) {
    event.preventDefault();
    tx = parseInt(event.target.x.value);
    ty = parseInt(event.target.y.value);
    if (isNaN(tx) || isNaN(ty) || tx >= 16 || ty >= 16 || tx < 0 || tx < 0) {
      // console.log("setting defaults")
      tx = -1;      ty = 0;
    }
    
    if (tx >= -1 && ty >= 0) {
      console.log(tx + " " + ty + event.target.bidKind.value + event.target.buildingName.value + event.target.groupName.value);
      AddBuilding.call({"gameCode": Template.instance().gameCode.get(), "locx": tx, "locy": ty, "bidKind": event.target.bidKind.value, "buildingName": event.target.buildingName.value, "groupName": event.target.groupName.value});    
    }
    else {
      console.log(tx + " " + ty + "broken locs");
    }
    
  },

  'submit .removeBuilding'(event, instance) {
    event.preventDefault();
    RemoveBuilding.call({"gameCode": Template.instance().gameCode.get(), "buildingId": event.target.presentBuilding.value}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("removing one building!");
      }
    });
    // console.log(event);
    // console.log(event.target.presentBuilding);
  },

  'submit .addFacts' (event, instance) {
    event.preventDefault();
    facts = event.target.amount.value;
    if (facts == "") {
      facts = -1;
    }
    SpawnFactories.call({"gameCode": Template.instance().gameCode.get(), "producerCount": facts});
  },

  'submit .newCustomRound' (event, instance) {
    event.preventDefault();
    console.log(event.target.amount.value);
    facts = event.target.amount.value;
    if (facts == "") {
      facts = -1;
    }
    NewRound.call({"gameCode": Template.instance().gameCode.get(), "producerCount": facts});

  },

  'click .reset' (event, instance) {
    ResetAll.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
    });
  },

  'click .addAuction'(event, instance) {
    console.log("adding building to auction");
    BuildingToAuction.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("buildings run!");
      }
    })
  },

  'click .runBids'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    RunBids2.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("bids run!");
      }
    })
  },

  'click .runBuildings'(event, instance) {
    console.log("run buildings");
    RunBuildings.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("buildings run!");
      }
    })
  },

  'click .asyncTest'(event, instance) {
    AsyncTest.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("round run!");
      }
    })
  },

  'click .resetRes'(event, instance) {
    ResetResources.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("resources reset!");
      }
    })
  },

  'click .resetMap'(event, instance) {
    // ResetResources.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
    //   if (err) {console.log(err);}
    //   else {
    //     console.log("resources reset!");
    //   }
    // })
  },

  'click .resetTeamResources'(event, instance) {
    
    ResetTeamResources.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("resources reset!");
      }
    })
  },

  'click .makeMap'(event, instance) {
    
    MakeMap.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("map made!");
      }
    })
  },

  'click .refreshReplenishes'(event, instance) {
    
    RefreshReplenishments.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("resources' replneishments refreshed!");
      }
    })
  },

  // 'click .runBuildings'(event, instance) {
  //   console.log("run buildings");
  //   RunBuildings.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
  //     if (err) { console.log(err); }
  //     else {
  //       console.log("buildings run!");
  //     }
  //   })
  // },

  'click .removeBuildings'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    RemoveBuilds.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) { console.log(err); }
      else {
        console.log("removing all buildings!");
      }
    });
  },

  'click .newRound'(event, instance) {
    // increment the counter when button is clicked
    // instance.counter.set(instance.counter.get() + 1);
    NewRound.call({"gameCode": Template.instance().gameCode.get()}, (err, res) => {
      if (err) {console.log(err);}
      else {
        console.log("round run!");
      }
    })
  },

  'click .seeScore' (event, instance) {
    FlowRouter.go('App.scoreboard', {gameCode: Template.instance().gameCode.get()});
  },

  'click .toggleGameState' (event, instance) {
    // var status = instance;
    var status = Games.findOne({"gameCode": Template.instance().gameCode.get()}).status;
    // console.log(status);
    ToggleGameRunning.call({"gameCode": Template.instance().gameCode.get(), "currentState": status});
  }
});
