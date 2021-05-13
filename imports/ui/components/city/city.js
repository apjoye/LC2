import './city.html';
import { ReactiveVar } from 'meteor/reactive-var';

import { Cities } from '/imports/api/links/links.js';

import { Maps } from '/imports/api/links/links.js';
import { Resources } from '/imports/api/links/links.js';
import { Buildings } from '/imports/api/links/links.js';
import { Acts } from '/imports/api/links/links.js';

import { Producers } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import '/imports/ui/stylesheets/style.css';

import { PlaceBuilding } from '/imports/api/links/methods.js';
import { ToggleBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilding } from '/imports/api/links/methods.js';
import { ToggleFactory } from '/imports/api/links/methods.js';
import { ReadNotif }  from '/imports/api/links/methods.js';
import 'animate.css/animate.css';

// import { NewRound } from '/imports/api/links/methods.js';

Template.cities.onCreated(function helloOnCreated() {
  Meteor.subscribe('cities.all');
  Meteor.subscribe('producers.public');
  Meteor.subscribe('producers.owned');
  Meteor.subscribe('games.running');
});

Template.cities.helpers({

  allCities() {
    return Cities.find();
  },

  notCityView() {
    cname = FlowRouter.current().params.city;
    if (Cities.find({"name": cname}).fetch().length > 0) {
      return false;
    }
    else {
      return true;
    }
  },

  citySet() {
    thisgame = [Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]})];
    // return Games.find({"name": cname});
    return thisgame;
  }
});

Template.city.onCreated(function helloOnCreated() {
  Meteor.subscribe('producers.owned');
  Meteor.subscribe('games.minerunning');
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('trades.city', FlowRouter.getParam('gameCode'));
  this.gameInfo = new ReactiveVar({});
  this.labelVisibility = new ReactiveVar({"index": 1, "list": ["visibile", "hidden"]});
  // this.roundProduction = new ReactiveVar({});
});

Template.city.helpers({
  getLabelVis() {
    lv = Template.instance().labelVisibility.get()
    return lv["list"][lv["index"]];
  },

  cityResources() {
    resImages = {
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
    prodOutput = {"copper": 0, "clay": 0, "lumber": 0, "food": 0, "pollution": 0, "population": 0, "happiness": 0};
    prodOutStr = {"copper": "+0", "clay": "+0", "lumber": "+0", "food": 0, "pollution": 0};

    // console.log(Games.find({"playerId": Meteor.userId()}).fetch());

    thisGame = Games.findOne({$and: [{"gameCode": FlowRouter.getParam("gameCode"), "playerId": Meteor.userId()}]})
    Template.instance().gameInfo.set(thisGame);


    // ROUND PRODUCTION INFORMATION SET UP HERE
    runningBuilds = Buildings.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"running": true}, {"owned": true}, {"ownerId": Meteor.userId()}]});

    runningBuilds.forEach(function (build) {
      for (r in build.prodVal) {        prodOutput[r] += build.prodVal[r];      }
      for (r in build.prodCost) {        prodOutput[r] = prodOutput[r] - build.prodCost[r];      }
    });

    for (k in prodOutput) {
      if (prodOutput[k] >= 0) {        prodOutStr[k] = "+" + prodOutput[k].toString();      }
      else {       prodOutStr[k] = prodOutput[k].toString();       }
    }


    //GETTING OTHER CITY STATS INFO IN HERE
    resPrint = [];
    // console.log(thisGame);
    // resPrint.push({
      // "roundProduction": "Change",
      // "amount": "Current",
      // "res": "Resources",
    // });
    for (r in thisGame.res) {
      thisRes = {"res": r};
      thisRes["amount"] = thisGame.res[r];
      thisRes["image"] = resImages[r];
      thisRes["roundProduction"] = prodOutStr[r];
      // console.log(prodOutStr[r]);
      resPrint.push(thisRes);
    }
    resPrint.push({
      // "roundProduction": "Change",
      // "amount": "Current",
      // "res": "Metrics",
    });
    otherStats = ["pollution", "population", "happiness"];
    for (r in otherStats) {
      thisRes = {"res": otherStats[r]};

      thisRes["amount"] = thisGame[otherStats[r]];
      thisRes["image"] = resImages[otherStats[r]];
      if (otherStats[r] == "pollution"){
        thisRes["roundProduction"] = prodOutStr[otherStats[r]];  
      }
      else {
        thisRes["roundProduction"] = " - ";
      }
      

      // console.log(thisRes + r);
      resPrint.push(thisRes);
    }

    return resPrint;
  },

  tradeAlerts() {
    ts = Acts.find({
      $and: [
        {"gameCode": FlowRouter.getParam("gameCode")},
        {"readBy": {$not: Meteor.userId()}},
        {$or: [
          {"from.group": Template.instance().gameInfo.get().group},
          {"to.group": Template.instance().gameInfo.get().group}
        ]},
        {"success": true}
      ]});
    // console.log(Template.instance().gameInfo.get().group);
    console.log(ts.fetch());
    return ts;
  },

  tradeHistory() {
    ts = Acts.find({
      $and: [
        {"gameCode": FlowRouter.getParam("gameCode")},
        // {"readBy": {$not: Meteor.userId()}},
        {$or: [
          {"from.group": Template.instance().gameInfo.get().group},
          {"to.group": Template.instance().gameInfo.get().group}
        ]},
        {"success": true}
      ]});
    // console.log(Template.instance().gameInfo.get().group);
    console.log(ts.fetch());
    return ts;
  },

  cityFactories() {
    return Producers.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"owned": true}, {"ownerId": Meteor.userId()}]});
  },

  producerColor() {
    // producerColors = {
    //   "p1": "#BBFF99",
    //   "p2": "#BBFF99",
    //   "m1": "#C6C6DB",
    //   "m2": "#C6C6DB",
    //   "f1": "#FFFF80",
    //   "f2": "#FFFF80"
    // }
    producerColors = {
      "p1": "(105, 105, 105, ",
      "p2": "(105, 105, 105, ",
      "m1": "(105, 105, 105, ",
      "m2": "(105, 105, 105, ",
      "f1": "(105, 105, 105, ",
      "f2": "(105, 105, 105, "
    }
    alpha = 0.3;
    if (this.running == true) {
      producerColors = {
        "p1": "(187, 255, 153, ",
        "p2": "(187, 255, 153, ",
        "m1": "(198, 198, 219, ",
        "m2": "(198, 198, 219, ",
        "f1": "(255, 255, 128, ",
        "f2": "(255, 255, 128, "
      }
      alpha = 1;
    }
    // console.log(this);
    return "background-color:rgba" + producerColors[this.kind] + alpha + ")";
    // return this;
  },

  roundProduction(res) {
    prodOutput = {"copper": 0, "clay": 0, "lumber": 0, "food": 0, "pollution": 0, "population": "+0", "happiness": "+0"};
    prodOutStr = {"copper": "+0", "clay": "+0", "lumber": "+0", "food": "+0", "pollution": "+0", "population": "+0", "happiness": "+0"};
    runningBuilds = Buildings.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"running": true}, {"owned": true}, {"ownerId": Meteor.userId()}]});


    runningBuilds.forEach(function (build) {
      for (r in build.prodVal) {
        prodOutput[r] += build.prodVal[r];
      }

      for (r in build.prodCost) {
        prodOutput[r] = prodOutput[r] - build.prodCost[r];
      }
    });

    return prodOutStr[res];
  }
});

Template.city.events ({
  'click .readNotif' (event) {
    console.log(event.target);
    ReadNotif.call({"logId": event.target.id, "userId": Meteor.userId()});
  },

  'click .resLabel' (event, instance) {
    lv = instance.labelVisibility.get();

    instance.labelVisibility.set({"index": (1 - lv.index), "list": lv.list});
  }
})


Template.cityMap.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minerunning');
  Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  this.selectedBuilding = new ReactiveVar({});
  this.selectedLoc = new ReactiveVar("");
  this.fullmap = new ReactiveVar({});
  this.game = new ReactiveVar({});
  this.buildings = new ReactiveVar({});
  this.imageMode = new ReactiveVar(true);

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
      "red-city": "rgba(255,0,0,0.2)",
      "yellow-city": "rgba(255,255,0,0.2)",
      "blue-city": "rgba(0,0,255,0.2)",
      "green-city": "rgba(0,255,0,0.2)",
      "pink-city": "rgba(255, 51, 153, 0.2)",
    }

    resImages = {
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

    this.mapTiles = mapTiles;
    this.resImages = resImages;
    this.bgColors = bgColors;
});

Template.cityMap.helpers({
  mapRows() {
    mapTiles = Template.instance().mapTiles;
    bgColors = Template.instance().bgColors;
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
    // mapTiles = thisGame.mapTiles;
    // mapTiles = this.mapTiles;
    // console.log(mapTiles);

    for (r in resources) {
      resDict[resources[r]["_id"]] = resources[r];
    }
    for (b in buildings) {
      buildDict[buildings[b]["_id"]] = buildings[b];
    }
    // console.log(resDict);
    
    // console.log(map);

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
    }
    // console.log("neighbor ing up");
    for (var i = cornerY; i < endCornerY; i++) {
      for (var j = cornerX; j < endCornerX; j++) {
        loc = "x" + j + "y" + i;
        // console.log(loc);
        neighbs = [[-1, 0], [0, -1], [1, 0], [0, 1]];
        if (!(loc in resMapDict)) {
          resMapDict[loc] = {};
        }
        if (!("neighbors" in resMapDict[loc])) {
          resMapDict[loc]["neighbors"] = [];
        }
      }
    }
    for (var i = cornerY; i < endCornerY; i++) {
      for (var j = cornerX; j < endCornerX; j++) {
        loc = "x" + j + "y" + i;
        for (n in neighbs) {
          nx = j + neighbs[n][0];
          ny = i + neighbs[n][1];
          // if (nx >= 0 && ny >= 0 && nx < endCornerX && ny < endCornerY) {
          if (nx >= cornerX && ny >= cornerY && nx < endCornerX && ny < endCornerY) {
            nloc = "x" + nx + "y" + ny;
            // console.log("adding " + nloc);
            resMapDict[loc]["neighbors"].push(resMapDict[nloc]);
          }
        }
      }
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
        rowCol["loc"] = loc;
        if (loc in resMapDict) {
          if ("owner" in resMapDict[loc]) {
            rowCol["image"] = "../img/bg/empty.png";
            rowCol["bgColor"] = bgColors[resMapDict[loc]["owner"]];
            if (loc == Template.instance().selectedLoc.get()){
              rowCol["bgColor"][rowCol["bgColor"].indexOf(".")]
            }
            rowCol["text"] += JSON.stringify(resMapDict[loc]["owner"]);
          }
          rowCol["text"] = "";
          if ("resource" in resMapDict[loc]) {
            rowCol["image"] = mapTiles[resMapDict[loc]["resource"]["kind"]];
            rowCol["text"] = JSON.stringify(resMapDict[loc]["resource"]["stats"]);
          }
          if ("building" in resMapDict[loc]) {
            // console.log(resMapDict[loc]["building"]["kind"]);
            rowCol["image"] = mapTiles[resMapDict[loc]["building"]["name"]];
            rowCol["text"] += JSON.stringify(resMapDict[loc]["building"]["buildFeatures"]["resKind"]);

            if ("neighboringResource" in resMapDict[loc]["building"] && "neighborBonus" in resMapDict[loc]["building"]) {
              rowCol["text"] += "Resource nearby, bonus production possible!";
            }

            if (resMapDict[loc]["building"]["running"] == true) {
              rowCol["text"] += " running ";
            }
            else {
              rowCol["image"] = rowCol["image"].substr(0,rowCol["image"].indexOf(".png")) + "_g.png"
              rowCol["text"] += " idle ";
            }
          }
          resMapDict[loc]["rowCol"] = rowCol;
          thisRow.push(rowCol);
        }
        else {
          thisRow.push({"rowCol": ""});
        }
      }
      rows.push(thisRow);
    }
    Template.instance().fullmap.set(resMapDict);
    // console.log(rows);
    // console.log(resMapDict);
    return rows;
  },

  boughtBuildings() {
    bb =  Buildings.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"ownerId": Meteor.userId()}, {"location": {$exists: false}} ]})
    mapTiles = Template.instance().mapTiles;
    bb = bb.fetch();

    for (b in bb) {
      bb[b]["image"] = mapTiles[bb[b]["name"]];
    }
    return bb;
  },

  equals: function(a, b) {
    return a == b;
  },

  buildingPlacable(building) {
    buyingBuilds = ["claymine", "coppermine", "foodfarm", "foodfishing", "foodhunting", "lumbercamp"];
    map = Template.instance().fullmap.get();
    loc = Template.instance().selectedLoc.get();
    mapSelect = map[loc];
    placeMode = false;
    placable = false;
    placeBonus = false;
    placeBonusStyle = "";
    placeOut = "";
    // console.log(mapSelect);
    if (mapSelect == "" || mapSelect == {} || mapSelect == undefined) {}
    else {
      // console.log(m)
      if (!("building" in mapSelect)) {
        if ( mapSelect["ownerId"] == Meteor.userId() ) {
          // console.log("placable true");
          placeMode = true;
        }
      }
    }

    // console.log(mapSelect.neighbors);
    nc = mapSelect["neighbors"]
    if (placeMode) {
      if ("neighborNeed" in building){
        nn = building["neighborNeed"]["resources"];
        placable = false;
        for (c in nc) {
          if ("resource"in nc[c]) {
            if (nc[c]["resource"]["kind"] == nn) {
              placable = true;
            }
          }
        }
        // }
      }
      else {
        placable = true;
        placeOut = "place";
        if ("neighborBonus" in building) {
          nb = building["neighborBonus"]["resources"];
          for (c in nc) {
            if ("resource"in nc[c]) {
              if (nc[c]["resource"]["kind"] == nb) {
                placeBonus = true;
                placeBonusStyle = "placeBonus";
                placeOut = "bonus";
              }
            }
          }
        }
      }
    }
    else {
      placeable = false;
    }
    // return {"placable": placable, "placeBonus": placeBonus, "placeBonusStyle": placeBonusStyle};
    // return placeOut;
    return placable;
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
      // console.log(mapSelect == {});
      if ("rowCol" in mapSelect) {
        boxContent["image"] = mapSelect["rowCol"]["image"];
      }
      // 
      if ("building" in mapSelect) {
        boxContent["placedBuilding"] = true;
        boxContent["building"] = mapSelect["building"];
        boxContent["image"] = Template.instance().mapTiles[mapSelect["building"]["name"]];
        console.log(boxContent);
        boxContent["text"].push(JSON.stringify(mapSelect["building"]["name"]));
        pcs = mapSelect["building"]["prodCost"];
        pcText = [];
        for (pc in pcs) {
          if (pcs[pc] != 0) {
            pcText += pc + ": " + pcs[pc] + " ";
          }
        }
        // boxContent["text"].push("Uses: " + JSON.stringify(pcText));
        // boxContent["text"].push("Produces: " + JSON.stringify(mapSelect["building"]["prodVal"]));
        boxContent["text"].push(JSON.stringify(mapSelect["building"]["infoText"]));
        if ("neighboringResource" in mapSelect["building"] && "neighborBonus" in mapSelect["building"]) {
          boxContent["text"].push(" Resource nearby, bonus production possible! ");
        }
        boxContent["buildingButtons"] = true;
        if (mapSelect["building"]["running"] == true) {
          boxContent["status"] = "Running";
          boxContent["buttonStatus"] = "checked";
        }
        else {
          boxContent["status"] = "Idle";
          boxContent["image"] = boxContent["image"].slice(0, -4) + "_g.png";
          boxContent["buttonStatus"] = "";
        }
      }
      else {
        if (mapSelect.ownerId == Meteor.userId()) {
          // console.log("owned cell, looking into neighbors");
          boxContent["image"] = "../img/buildings/construction.png";
          boxContent.text.push("You own this cell! Place some buildings here!");
          resTexts = {
            "water": "Water nearby! You can fish here. Also, farms produce 2 extra food, but pollute the water. Pollution from the water seeps into your city as well",
            "lumber": "Woods nearby! You can hunt and collect lumber here.",
            "clay": "Clay ore nearby! Mines work extra here! They produce more pollution, and also collect bonus clay if there are deposits in the ores.",
            "copper": "Copper ore nearby! Mines work extra here! They produce more pollution, and also collect bonus copper if there are deposits in the ores."
          }
          neighbs = mapSelect.neighbors;
          found = [];
          for (n in neighbs) {
            if ("resource" in neighbs[n]) {
              for (rt in resTexts) {
                if (neighbs[n].resource.kind == rt && found.indexOf(rt) == -1) {
                  boxContent.text.push(resTexts[rt]);
                  found.push(rt);
                }
              }
            }
          }
        }
        else {
          boxContent["image"] = "../img/buildings/no-construction.png";
          boxContent.text.push("You don't own this cell! Place buildings on cells you own.");
          if ("resource" in mapSelect) {
            resTexts2 = {
              "water": "This cell has water! Farms in adjacent squares produce 2 extra food, but pollute the water. Pollution from the water seeps into your city as well. You can also collect available fish for food from this!",
              "lumber": "Woods nearby! You can hunt and collect lumber here.",
              "clay": "Clay ore here! Clay mines placed adjacently use the ore, produce extra clay, and also extra pollution.",
              "copper": "Copper ore here! Copper mines placed adjacently use the ore, produce extra clay, and also extra pollution.",
            }
            boxContent.text.push(resTexts2[mapSelect["resource"]["kind"]]);
          }
        }
      }
    }
    // console.log(mapSelect);
    // console.log(boxContent);
    return boxContent;
  },

  imageMode() {
    return Template.instance().imageMode.get();
  }

});

Template.cityMap.events({
  'click .toggleImages' (event, instance) {
    // console.log(Template.instance().imageMode.get());
    Template.instance().imageMode.set(!Template.instance().imageMode.get());
  },
  'click .mapCell' (event, instance) {
    event.preventDefault();
    // loc = event.target.classList[1];
    loc = event.target.classList[2];
    // instance.selectedLoc.set(event.target.id);
    instance.selectedLoc.set(loc);
    console.log(loc);
    // console.log(document.getElementById("cell-" + loc).getBoundingClientRect());
    cellLoc = document.getElementById("cell-" + loc).getBoundingClientRect();
    d = document.getElementById("cell-highlighter");
      d.style.position = "absolute";
      d.style.left = (cellLoc.x + window.scrollX) +'px';
      d.style.top = (cellLoc.y + window.scrollY) +'px';
      d.style.width = cellLoc.width + "px";
      d.style.height = cellLoc.height + "px";
      // d.style
    // map = instance.fullmap.get();

  },
  
  'zoom .updateSelect': function (event, instance){
    console.log('11');
    event.preventDefault();
    loc = instance.selectedLoc.get();
    console.log(loc);
    cellLoc = document.getElementById("cell-" + loc).getBoundingClientRect();
    d = document.getElementById("cell-highlighter");
      d.style.position = "absolute";
      d.style.left = (cellLoc.x + window.scrollX) +'px';
      d.style.top = (cellLoc.y + window.scrollY) +'px';
      d.style.width = cellLoc.width + "px";
      d.style.height = cellLoc.height + "px";
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
  
  'click .startPlace': function (event, instance) {
    event.preventDefault();
    document.getElementById("confirmPlace-" + event.target.id.slice(11)).style.display = "block";
    document.getElementById(event.target.id).style.display = "none";
  },

  'click .cancelPlace': function (event, instance) {
    event.preventDefault();
    document.getElementById("confirmPlace-" + event.target.id.slice(12)).style.display = "none";
    document.getElementById("startPlace-" + event.target.id.slice(12)).style.display = "block";
  },

  'click .toggleBuilding': function (event, instance) {
    // event.preventDefault();
    console.log(event.target)
    bb = Template.instance().data.map[Template.instance().selectedLoc.get()]["building"];
    bs = instance.buildings.get();
    pop = instance.game.get().population;
    console.log(pop);
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

  'click .startRemoval': function (event, instance) {
    event.preventDefault();
    // console.log(event.target.id);
    // console.log("removing building client " + (event.target.id).substr(7));
    // RemoveBuilding.call({"buildingId": (event.target.id).substr(7)});
    document.getElementById("startRemoval").style.display = "none";
    document.getElementById("finalRemoval").style.display = "block";
  },

  'click .removeBuilding': function (event, instance) {
    event.preventDefault();
    console.log(event.target.id);
    console.log("removing building client " + (event.target.id).substr(7));
    RemoveBuilding.call({"buildingId": (event.target.id).substr(7)});
  },

  'click .cancelRemoval': function (event, instance) {
    event.preventDefault();
    document.getElementById("startRemoval").style.display = "block";
    document.getElementById("finalRemoval").style.display = "none";
  },

});


Template.cityFactory.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  // Meteor.subscribe('cities.all');
  // Meteor.subscribe('producers.public');
  // Meteor.subscribe('producers.owned');
  // Meteor.subscribe('games.running');

});

Template.cityFactory.helpers({
  productionRes() {
   retres = [];

   // console.log(this.prodValues);
   for (r in this.prodValues) {
     if (r != "pollution" && this.prodValues[r] != 0) {
       // prodText += this.prodValues[r] + " " + r + "   ";
       retres.push({"resName": r, "resVal": this.prodValues[r], "resValArr": new Array(this.prodValues[r]).fill(0)});
     }
   }
   return retres;
 },

  productionValues() {
    prodText = "";

    // console.log(this.prodValues);
    for (r in this.prodValues) {
      if (r != "pollution" && this.prodValues[r] != 0) {
        prodText += this.prodValues[r] + " " + r + "   ";
      }
    }

    prodText += " Pollution: " + this.prodValues["pollution"];
    // console.log(prodText);

    return prodText;

    // return Producers.find({$and: [{"owned": true}, {"owner": this.name}]});
  },

  CostInfo(costList, startText) {
    // CostInfo() {
     costText = "";
     factoryOutputType = {
      "m1": "../img/icons/gold_sml.png",
      "f1": "../img/icons/food_sml.png",
      "m2": "../img/icons/steel_sml.png",
      "f2": "../img/icons/cotton_sml.png",
      "food": "../img/icons/cotton_sml.png",
      "clay": "../img/icons/clay.png",
      "copper": "../img/icons/copper.png",
      "lumber": "../img/icons/lumber.png",
      "pollution": "../img/icons/pollution_sml.png"
    };
    for (r in costList) {
     // console.log(r + " " + factoryOutputType[r]);
      if (costList[r] != 0 && costList[r] != undefined) {
       // costText += costList[r] + " " + r + ", ";

      costText += costList[r];
      costText += '<img class="resourceIcon" src="' + factoryOutputType[r] + '" />';
      }
    }

  if (costText != "") {
     costText = startText + "<br />" + costText;
   }
   else {
     costText = '<br/> <img class="resourceIcon" src="../img/icons/blank.png" </br>';
   }
   return costText;
  },

  productionCosts() {
    costText = "";
    // console.log(this.prodCosts);
    for (r in this.prodCosts) {
      if (this.prodCosts[r] != 0) {
        costText += this.prodCosts[r] + " " + r + "   ";
      }
    }
    // prodText += " Pollution: " + this.prodValues["poll"];
    // console.log(costText);

    return costText;
  },

  factoryIcon() {
    factoryIconSource = {
      "p1": "../img/icons/park_med.png",
      "p2": "../img/icons/park_med.png",
      "m1": "../img/icons/factory_med.png",
      "m2": "../img/icons/factory_med.png",
      "f1": "../img/icons/farm_med.png",
      "f2": "../img/icons/farm_med.png"
    }
    // console.log(this);
    // console.log(factoryIconSource[this.kind]);
    return factoryIconSource[this.kind];
  },

  runningStatus() {
    if (this.running == true) {
      return "Running";
    }
    else {
      return "Turned Off";
    }
  }

  // FactoryNotes() {

  // }
});

Template.cityFactory.events({
  'click .toggleRunning' (event,instance) {
    event.preventDefault();
    // console.log(instance);
    // console.log(this.running);
    // runners = Producers.find({$and: [{"running": true}, {"gameCode": FlowRouter.getParam("gameCode")}, {"owned": true}, {"ownerId": Meteor.userId()}]}).fetch();
    // thisGame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]});

    // if (runners.length >= thisGame.population && this.running == false) {
      // console.log("not enough people!!!");
      //alert("Everybody's already employed!");
    // }
    // else {
      ToggleFactory.call({"producerId": this._id, "currentStatus": this.running, "gameCode": FlowRouter.getParam("gameCode"), "baseId": Meteor.userId()}, function (err, res) {
        if (err) {
          console.log(err);
        }
        else {
          // $('.factoryIcon').addClass('animated bounce');
        }
      });
    // }
  }
});

//sticky score bar function
/*
$(window).scroll(function(){
  if($(this).scrollTop() >= 82){
    $('.fixed-top-bar').addClass('fixed');
  }else{
    $('.fixed-top-bar').removeClass('fixed');
  }
});
*/


/*
function updateSelect(blueElem){
    loc = instance.selectedLoc.get();
    console.log(loc);
    cellLoc = document.getElementById("cell-" + loc).getBoundingClientRect();
    d = document.getElementById("cell-highlighter");
    d.style.position = "absolute";
    d.style.left = (cellLoc.x + window.scrollX) +'px';
    d.style.top = (cellLoc.y + window.scrollY) +'px';
    d.style.width = cellLoc.width + "px";
    d.style.height = cellLoc.height + "px";
}
*/

/*
window.addEventListener("resize", myFunction);
function myFunction(){
    
    loc = event.target.classList[2];
    instance.selectedLoc.set(loc);
    console.log(loc);
    cellLoc = document.getElementById("cell-" + loc).getBoundingClientRect();
    d = document.getElementById("cell-highlighter");
    d.style.position = "absolute";
    d.style.left = (cellLoc.x + window.scrollX) +'px';
    d.style.top = (cellLoc.y + window.scrollY) +'px';
    d.style.width = cellLoc.width + "px";
    d.style.height = cellLoc.height + "px";
}
*/

