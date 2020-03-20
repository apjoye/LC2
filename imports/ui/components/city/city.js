import './city.html';
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
import { ToggleFactory } from '/imports/api/links/methods.js';
import 'animate.css/animate.css';

// import { NewRound } from '/imports/api/links/methods.js';

Template.cities.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  Meteor.subscribe('cities.all');
  Meteor.subscribe('producers.public');
  Meteor.subscribe('producers.owned');
  Meteor.subscribe('games.running');
  
});

Template.cities.helpers({
  // counter() {
  //   return Template.instance().counter.get();
  // },
  allCities() {
    // console.log((Producers.find({})).toArray());
    // console.log(FlowRouter.current().params.city)
    return Cities.find();
  },

  notCityView() {
    cname = FlowRouter.current().params.city;
    // console.log(Cities.find({"name": cname}).fetch());
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
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  // Meteor.subscribe('cities.all');
  // Meteor.subscribe('producers.public');
  Meteor.subscribe('producers.owned');
  Meteor.subscribe('games.running');
  // Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  // Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  
});

Template.city.helpers({
  

  cityFactories() {
    // console.log(Producers.find({}).fetch());
    // console.log(Producers.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"owned": true}, {"ownerId": Meteor.userId()}]}).fetch());
    // console.log(FlowRouter.getParam("gameCode") + " " + Meteor.userId());
    // console.log(Producers.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"ownerId": Meteor.userId()}]}).fetch());
    
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

  roundProduction() {
    prodOutput = {"m1": 0, "m2": 0, "f1": 0, "f2": 0, "pollution": 0};
    prodOutStr = {"m1": "+0", "m2": "+0", "f1": "+0", "f2": "+0", "pollution": "+0"};
    runningProds = Producers.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"running": true}, {"owned": true}, {"ownerId": Meteor.userId()}]});
    var parks = 0;
    runningProds.forEach(function (prod) {
      if (prod.kind == "p1" || prod.kind == "p2") {
        parks += 1;
      }
      for (r in prod.prodValues) {
        prodOutput[r] += prod.prodValues[r];
        // console.log(prod)
        // prodOutput[r] = prodOutput[r] - prod.prodCosts[r];
      }

      for (r in prod.prodCosts) {
        // console.log(prod.prodCosts);
        // console.log(r);
        // console.log(prod.prodCosts[r])
        prodOutput[r] = prodOutput[r] - prod.prodCosts[r];
      }
    });

    var thisgame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}, {"status": "running"}, {"role": "base"}]})
    var totalFood = thisgame.res.f1 + thisgame.res.f2 + prodOutput["f1"] + prodOutput["f2"];
    var foodToPoll = totalFood / (thisgame.pollution + prodOutput["pollution"]);
    var parksToPop = parks / thisgame.population;
    // prodOutput["parksToPop"] = parksToPop;
    // prodOutput["foodToPoll"] = foodToPoll;
    var happChange = 0;
    var popChange = 0;
    if (parksToPop <= 0.25) {
      happChange += -1;
    }
    else if (parksToPop >= 0.6) {
      happChange += 1;
    }

    if (foodToPoll < 0.7) {
      popChange += 1;
    }
    else {
      popChange += -1;
    }
    prodOutput["population"] = popChange;
    prodOutput["happiness"] = happChange;

    for (k in prodOutput) {
      if (prodOutput[k] >= 0) {
        prodOutStr[k] = "+" + prodOutput[k].toString();
      }
      else {
       prodOutStr[k] = prodOutput[k].toString(); 
      }
    }

    // console.log(thisgame);
    // console.log(prodOutput);
    return prodOutStr;
  }

});


Template.cityMap.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  // Meteor.subscribe('cities.all');
  // Meteor.subscribe('producers.public');
  // Meteor.subscribe('producers.owned');
  Meteor.subscribe('games.running');
  Meteor.subscribe('maps.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('resources.thisGame', FlowRouter.getParam('gameCode'));
  Meteor.subscribe('buildings.city', FlowRouter.getParam('gameCode'));
  Template.instance().data["selectedBuilding"] = "";
  
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
    
    // console.log(resMapDict);

    //add buildings, ownership, and resources stats to each cell

    for (var i = cornerX; i < (cornerX + mapHeight); i++) {
      thisRow = [];
      for (var j = cornerY; j < (cornerY + mapHeight); j++) {
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
            // console.log(resMapDict[loc]["building"]["kind"]);
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
        }
        else {
          thisRow.push({"rowCol": ""});
        }
      }
      rows.push(thisRow);
    }
    // console.log(rows);
    return rows;
  },

  boughtBuildings() {
    // console.log(Meteor.userId());
    bb =  Buildings.find({$and: [{"gameCode": FlowRouter.getParam("gameCode")}, {"ownerId": Meteor.userId()}, {"location": {$exists: false}} ]})
    // console.log(bb.fetch());
    return bb;
  }

});

Template.cityMap.events({
  'click .mapCell' (event, instance) {
    event.preventDefault();
    // console.log(event.target.id);
    mapLoc = Template.instance().data.map[event.target.id]
    console.log(mapLoc);
    if (mapLoc != undefined) {
      if ("building" in mapLoc) {
        bb = mapLoc["building"];
        ToggleBuilding.call({"buildingId": bb["_id"], "currentStatus": bb["running"], "gameCode": bb["gameCode"], "ownerId": bb["ownerId"]});
      }
      else {
        if ("ownerId" in mapLoc){
          if (mapLoc["ownerId"] == Meteor.userId()) {
            console.log("empty owned spot!");
            selectedBuilding = Template.instance().data["selectedBuilding"];
            console.log(selectedBuilding);
            if (selectedBuilding != "" && selectedBuilding != undefined) {
              loc = [mapLoc["x"], mapLoc["y"]];
              console.log(loc);
              PlaceBuilding.call({"gameCode": FlowRouter.getParam("gameCode"), "buildingId": selectedBuilding, "location": loc, "userId": Meteor.userId()});
              // buildingId, location, userId
            }
          }
          else {
            console.log("spot owned by someone else?");
          }
        }
        else {
          console.log("unowned spot!")
        }
      }
    }
    
    // console.log(selectedBuilding);
    
    
  },

  'click .boughtBuilding': function (event, instance) {
    event.preventDefault();
    if (event.target.id == Template.instance().data["selectedBuilding"]) {
      Template.instance().data["selectedBuilding"] = "";  
    }
    else {
      Template.instance().data["selectedBuilding"] = event.target.id;
    }
    console.log(Template.instance().data["selectedBuilding"]);
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

