import './map.html';
import '../city/city.js';
import '/imports/ui/stylesheets/style.css';

import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Cities } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';
import { Maps } from '/imports/api/links/links.js';
import { Resources } from '/imports/api/links/links.js';
import { Buildings } from '/imports/api/links/links.js';

import { PlaceBuilding } from '/imports/api/links/methods.js';
import { ToggleBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilding } from '/imports/api/links/methods.js';

// import 'animate.css/animate.css';

// import { NewRound } from '/imports/api/links/methods.js';

Template.map.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minerunning');
  Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  this.selectedBuilding = new ReactiveVar({});
  this.selectedLoc = new ReactiveVar("");
  this.fullmap = new ReactiveVar({});
  this.game = new ReactiveVar({});
  this.buildings = new ReactiveVar({});
  this.imageMode = new ReactiveVar(false);
  // console.log(this);
});

Template.map.helpers({
  imageMode() {
    return Template.instance().imageMode.get();
  },

  mapRows() {
     mapTiles = {
      "claymine": "../img/buildings/claymine.png",
      "coppermine": "../img/buildings/coppermine.png",
      "foodfarm": "../img/buildings/foodfarm.png",
      "foodfishing": "../img/buildings/foodfishing.png",
      "foodhunting": "../img/buildings/foodhunting.png",
      "lumbercamp": "../img/buildings/lumbercamp.png",
      "background": "../img/resources/grass.png",
      "empty": "../img/resources/emtpy.png",
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
    //store map dimensions somewhere
    thisGame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]});
    // console.log(thisGame);
    Template.instance().game.set(thisGame);
    mapWidth = thisGame["visibleDimensions"][0];    //number of columns
    mapHeight = thisGame["visibleDimensions"][1];   //number of rows
    cornerX = thisGame["visibleCorner"][0];
    cornerY = thisGame["visibleCorner"][1];
    endCornerY = cornerY + mapHeight;
    endCornerX = cornerX + mapWidth;
    rows = [];
    map = Maps.find({"gameCode": gameCode}).fetch();
    resources = Resources.find({"gameCode": gameCode}).fetch();
    buildings = Buildings.find({$and: [{"ownerId": Meteor.userId()}, {"gameCode": gameCode}]}).fetch();
    Template.instance().buildings.set(buildings);
    // console.log(resources);
    resMapDict = {};
    resDict = {};
    buildDict = {};
    mapTiles = thisGame.mapTiles;
    // console.log(mapTiles);

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
          // console.log(loc);
          // console.log(resMapDict[loc]);
        }
      }
      if ("resId" in map[m]) {
        if (map[m]["resId"] in resDict){
          resMapDict[loc]["resource"] = resDict[map[m]["resId"]];
        }
      }
      neighbs = [[-1, 0], [0, -1], [1, 0], [0, 1]]
      for (n in neighbs) {
        nx = map[m].x + neighbs[n][0];
        ny = map[m].y + neighbs[n][1]
        if (nx >= 0 && ny >= 0 && nx < endCornerX && ny < endCornerY) {
          nloc = "x" + nx + "y" + ny;
          if (!(nloc in resMapDict)) {
            resMapDict[nloc] = {};
          }
          if (!("neighbors" in resMapDict[nloc])) {
            resMapDict[nloc]["neighbors"] = [];
            // console.log("given")
          }
          // console.log()
          resMapDict[nloc]["neighbors"].push(resMapDict[loc]);
        }
       }
      // }
    }

    resMapDict[""] = {};

    Template.instance().data.map = resMapDict;
    Template.instance().fullmap.set(resMapDict);
    // console.log(resMapDict);

    //add buildings, ownership, and resources stats to each cell

    for (var i = cornerY; i < endCornerY; i++) {
      thisRow = [];
      for (var j = cornerX; j < endCornerX; j++) {
        loc = "x" + j + "y" + i;
        rowCol = {};
        rowCol["image"] = mapTiles["background"];
        rowCol["text"] = "";
        rowCol["bgColor"] = "";

        if (loc in resMapDict) {
          rowCol["loc"] = loc;
          rowCol["attributes"] = "";
          if ("owner" in resMapDict[loc]) {
            rowCol["image"] = mapTiles["empty"];
            rowCol["bgColor"] = bgColors[resMapDict[loc]["owner"]];
          }

          rowCol["text"] = "";
          if ("resource" in resMapDict[loc]) {
            rowCol["image"] = mapTiles[resMapDict[loc]["resource"]["kind"]];
            rowCol["text"] = JSON.stringify(resMapDict[loc]["resource"]["stats"]);
          }
          if ("building" in resMapDict[loc]) {
            if (resMapDict[loc]["building"]["ownerId"] == Meteor.userId()){
              rowCol["image"] = mapTiles[resMapDict[loc]["building"]["name"]];
            }
            // console.log(resMapDict[loc]["building"]["kind"]);
            // rowCol["imageSource"] = mapTiles[resMapDict[loc]["building"]["name"]];
            rowCol["text"] += JSON.stringify(resMapDict[loc]["building"]["buildFeatures"]["resKind"]);

            if ("neighboringResource" in resMapDict[loc]["building"]) {
              rowCol["text"] += " bonus ore! ";
            }

            if (resMapDict[loc]["building"]["running"] == true) {
              rowCol["text"] += " running ";
            }
            else {
              rowCol["text"] += " idle ";
            }
          }
          if ("owner" in resMapDict[loc]) {
            rowCol["text"] += JSON.stringify(resMapDict[loc]["owner"]);
          }
          thisRow.push(rowCol);
        }
        else {
          thisRow.push({"rowCol": ""});
        }
      }
      rows.push(thisRow);
    }
    console.log(rows);
    console.log(resMapDict);
    return rows;
  },

  boughtBuildings() {
    // console.log(Meteor.userId());
    bb =  Buildings.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"ownerId": Meteor.userId()}, {"location": {$exists: false}} ]})
    // console.log(Buildings.find().fetch());
    return bb;
  },

  buildingPlacable(building) {
    buyingBuilds = ["claymine", "coppermine", "foodfarm", "foodfishing", "foodhunting", "lumbercamp"];
    map = Template.instance().fullmap.get();
    loc = Template.instance().selectedLoc.get();
    mapSelect = map[loc];
    placeMode = false;
    // console.log(mapSelect);
    if (mapSelect == "" || mapSelect == {} || mapSelect == undefined) {}
    else {
      // console.log(m)
      if (!("building" in mapSelect)) {
        if ( mapSelect["ownerId"] == Meteor.userId() ) {
          console.log("placable true");
          placeMode = true;
        }
      }
    }
    // console.log(building.name);
    // console.log(building.name in buyingBuilds);
    // console.log(placeMode);
    // console.log(building.name in buyingBuilds && placeMode);
    if (buyingBuilds.indexOf(building.name) >= 0 && placeMode) {
      return true;
    }
    else {
      return false;
    }
  },

  currentBuilding() {
    text = "";
    boxContent = {};
    boxContent["text"] = [];
    map = Template.instance().fullmap.get();
    mapSelect = map[Template.instance().selectedLoc.get()];
    boxContent["mapCell"] = mapSelect;
    // console.log(mapSelect == undefined);
    if (mapSelect == "" || mapSelect == {} || mapSelect == undefined) {
    }
    else {
      if ("building" in mapSelect) {
        boxContent["text"].push(JSON.stringify(mapSelect["building"]["name"]));
        pcs = mapSelect["building"]["prodCost"];
        pcText = "";
        for (pc in pcs) {
          if (pcs[pc] != 0) {
            pcText += pc + ": " + pcs[pc] + " ";
          }
        }
        boxContent["text"].push("Uses: " + JSON.stringify(pcText));
        boxContent["text"].push("Produces: " + JSON.stringify(mapSelect["building"]["prodVal"]));
        if ("neighboringResource" in mapSelect["building"]) {
          boxContent["text"].push(" bonus ore! ");
        }
        boxContent["buildingButtons"] = true;
        if (mapSelect["building"]["running"] == true) {
          boxContent["status"] = "Running";
        }
        else {
          boxContent["status"] = "Idle";
        }
      }
    }
    // console.log(mapSelect);
    // console.log(boxContent);
    return boxContent;
  }

});

Template.map.events({
  'click .toggleImages' (event, instance) {
    console.log(Template.instance().imageMode.get());
    Template.instance().imageMode.set(!Template.instance().imageMode.get());
  },

  'click .mapCell' (event, instance) {
    event.preventDefault();
    // loc = event.target.classList[1];
    loc = event.target.classList[2];
    instance.selectedLoc.set(loc);
    console.log(loc);
    map = instance.fullmap.get();
    // console.log(map[loc]);
  },

  'click .placeBuilding': function (event, instance) {
    event.preventDefault();
    loc = instance.selectedLoc.get();
    x = loc.indexOf("x") + 1;
    y = loc.indexOf("y") - 1;
    buildLoc = [parseInt(loc.substr(x, y)), parseInt(loc.substr(y + 2))];
    // console.log(x + " " + y + " " + loc + " " + buildLoc);
    console.log(buildLoc);
    // console.log(event.target.id + " " + buildLoc);
    PlaceBuilding.call({"gameCode": FlowRouter.getParam("gameCode"), "buildingId": event.target.id, "location": buildLoc, "userId": Meteor.userId()});
  },

  'click .toggleBuilding': function (event, instance) {
    event.preventDefault();
    // bb = Template.instance().data.map[Template.instance().selectedLoc.get()]["building"];
    bb = instance.fullmap.get()[instance.selectedLoc.get()]["building"];
    bs = instance.buildings.get();
    pop = instance.game.get().population;
    // console.log(pop);
    workingPop = 0;
    for (b in bs) {
      if (bs[b]["running"] == true) {
        workingPop += 1;
      }
    }
    currStat = bb["running"];

    if (workingPop >= pop && currStat == false) {
      currStat = true;
      alert("all the people have buildings to work at!");
    }
    else {
      ToggleBuilding.call({"buildingId": bb["_id"], "currentStatus": bb["running"], "gameCode": bb["gameCode"], "ownerId": bb["ownerId"]});
    }
  },

  'click .removeBuilding': function (event, instance) {
    event.preventDefault();
    console.log(event.target.id);
    console.log("removing building client " + (event.target.id).substr(7));
    RemoveBuilding.call({"buildingId": (event.target.id).substr(7)});
  }

});