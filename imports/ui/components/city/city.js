import './city.html';
import { ReactiveVar } from 'meteor/reactive-var';

import { Cities } from '/imports/api/links/links.js';

import { Maps } from '/imports/api/links/links.js';
import { Resources } from '/imports/api/links/links.js';
import { Buildings } from '/imports/api/links/links.js';

import { Producers } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import '/imports/ui/stylesheets/style.css';

import { PlaceBuilding } from '/imports/api/links/methods.js';
import { ToggleBuilding } from '/imports/api/links/methods.js';
import { RemoveBuilding } from '/imports/api/links/methods.js';
import { ToggleFactory } from '/imports/api/links/methods.js';
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
  this.gameInfo = new ReactiveVar({});
});

Template.city.helpers({
  cityResources() {
    resImages = {
      "m1": "../img/icons/gold_sml.png",
      "f1": "../img/icons/food_sml.png",
      "m2": "../img/icons/steel_sml.png",
      "f2": "../img/icons/cotton_sml.png",
      "food": "../img/icons/food.png",
      "clay": "../img/icons/clay.png",
      "copper": "../img/icons/copper.png",
      "lumber": "../img/icons/lumber.png",
      "pollution": "../img/icons/pollution_sml.png",
      "population": "../img/icons/population_sml.png",
      "happiness": "../img/icons/happiness_sml.png"
    };
    // console.log(Games.find({"playerId": Meteor.userId()}).fetch());

    thisGame = Games.findOne({$and: [{"gameCode": FlowRouter.getParam("gameCode"), "playerId": Meteor.userId()}]})
    Template.instance().gameInfo.set(thisGame);
    resPrint = [];
    // console.log(thisGame);
    for (r in thisGame.res) {
      thisRes = {};
      thisRes["amount"] = thisGame.res[r];
      thisRes["image"] = resImages[r];
      resPrint.push(thisRes);
    }
    otherStats = ["pollution", "population", "happiness"];
    for (r in otherStats) {
      thisRes = {};
      thisRes["amount"] = thisGame[otherStats[r]];
      thisRes["image"] = resImages[otherStats[r]];
      // console.log(thisRes + r);
      resPrint.push(thisRes);
    }
    return resPrint;
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

  // roundProd() {

  // }

  roundProduction() {
    // prodOutput = {"m1": 0, "m2": 0, "f1": 0, "f2": 0, "pollution": 0};
    // prodOutStr = {"m1": "+0", "m2": "+0", "f1": "+0", "f2": "+0", "pollution": "+0"};
    prodOutput = {"copper": 0, "clay": 0, "lumber": 0, "food": 0, "pollution": 0};
    prodOutStr = {"copper": "+0", "clay": "+0", "lumber": "+0", "food": "+0", "pollution": "+0"};
    /*    
    runningProds = Producers.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"running": true}, {"owned": true}, {"ownerId": Meteor.userId()}]});
    
    var parks = 0;
    runningProds.forEach(function (prod) {
      if (prod.kind == "p1" || prod.kind == "p2") {
        parks += 1;
      }
      for (r in prod.prodValues) {
        prodOutput[r] += prod.prodValues[r];
      }

      for (r in prod.prodCosts) {
        prodOutput[r] = prodOutput[r] - prod.prodCosts[r];
      }
    });

    var thisgame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]})
    var totalFood = thisgame.res.f1 + thisgame.res.f2 + prodOutput["f1"] + prodOutput["f2"];
    var foodToPoll = totalFood / (thisgame.pollution + prodOutput["pollution"]);
    var parksToPop = parks / thisgame.population;
    var happChange = 0;
    var popChange = 0;
    if (parksToPop <= 0.25) {      happChange += -1;    }
    else if (parksToPop >= 0.6) {      happChange += 1;    }

    if (foodToPoll < 0.7) {      popChange += 1;    }
    else {      popChange += -1;    }
    prodOutput["population"] = popChange;
    prodOutput["happiness"] = happChange;

    for (k in prodOutput) {
      if (prodOutput[k] >= 0) {        prodOutStr[k] = "+" + prodOutput[k].toString();      }
      else {       prodOutStr[k] = prodOutput[k].toString();       }
    }
    */
    return prodOutStr;
  }
});


Template.cityMap.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minerunning');
  Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  this.selectedBuilding = new ReactiveVar({});
  this.selectedLoc = new ReactiveVar("");
  this.fullmap = new ReactiveVar({});
});

Template.cityMap.helpers({
  mapRows() {
    //store map dimensions somewhere
    thisGame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]});
    // console.log(thisGame);
    mapWidth = thisGame["visibleDimensions"][0];    //number of columns
    mapHeight = thisGame["visibleDimensions"][1];   //number of rows
    cornerX = thisGame["visibleCorner"][0];
    cornerY = thisGame["visibleCorner"][1];
    rows = [];
    map = Maps.find({"gameCode": gameCode}).fetch();
    resources = Resources.find({"gameCode": gameCode}).fetch();
    buildings = Buildings.find({$and: [{"ownerId": Meteor.userId()}, {"gameCode": gameCode}]}).fetch();
    // console.log(resources);
    resMapDict = {};
    resDict = {};
    buildDict = {};
    mapTiles = {
      "claymine": "../img/buildings/claymine.png",
      "coppermine": "../img/buildings/coppermine.png",
      "foodfarm": "../img/buildings/foodfarm.png",
      "foodfishing": "../img/buildings/foodfishing.png",
      "foodhunting": "../img/buildings/foodhunting.png",
      "lumbercamp": "../img/buildings/lumbercamp.png",
    }

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
        if (nx >= 0 && ny >= 0) {
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

    for (var i = cornerX; i < (cornerX + mapHeight); i++) {
      thisRow = [];
      for (var j = cornerY; j < (cornerY + mapHeight); j++) {
        loc = "x" + i + "y" + j;
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
            // console.log(resMapDict[loc]["building"]["kind"]);
            rowCol["text"] += JSON.stringify(resMapDict[loc]["building"]["buildFeatures"]["resKind"]);
            
            if ("neighboringResource" in resMapDict[loc]["building"]) {
              rowCol["text"] += " bonus ore! ";
              // console.log(resMapDict[loc]);
              // console.log(loc);
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
        }
        else {
          thisRow.push({"rowCol": ""});
        }
      }
      rows.push(thisRow);
    }
    // console.log(rows);
    // console.log(resMapDict);
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
    console.log(mapSelect);
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

Template.cityMap.events({
  'click .mapCell' (event, instance) {
    event.preventDefault();
    loc = event.target.classList[1];
    // instance.selectedLoc.set(event.target.id);
    instance.selectedLoc.set(loc);
    console.log(loc);
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
    bb = Template.instance().data.map[Template.instance().selectedLoc.get()]["building"];
    ToggleBuilding.call({"buildingId": bb["_id"], "currentStatus": bb["running"], "gameCode": bb["gameCode"], "ownerId": bb["ownerId"]});
  },

  'click .removeBuilding': function (event, instance) {
    event.preventDefault();
    console.log(event.target.id);
    console.log("removing building client " + (event.target.id).substr(7));
    RemoveBuilding.call({"buildingId": (event.target.id).substr(7)});
  }

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

