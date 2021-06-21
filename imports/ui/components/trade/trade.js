import './trade.html';
import { Meteor } from 'meteor/meteor';
// import { Cities } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';
import { TradeResources } from '/imports/api/links/methods.js';
import { ResetAll } from '/imports/api/links/methods.js';

Template.trade.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  Meteor.subscribe('games.running');
  this.gameInfo = new ReactiveVar({});
});

Template.trade.helpers({
  resource() {
    thisGame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": FlowRouter.getParam("gameCode")}]});
    console.log(thisGame);
    Template.instance().gameInfo.set(thisGame);
    return [
      // {"name": "m1", "displayName": "Gold"}, 
      // {"name": "m2", "displayName": "Steel"}, 
      // {"name": "f1", "displayName": "Food"}, 
      // {"name": "f2", "displayName": "Cotton"}];
      {"name": "copper", "displayName": "Copper"}, 
      {"name": "lumber", "displayName": "Lumber"}, 
      {"name": "food", "displayName": "Food"}, 
      {"name": "clay", "displayName": "Clay"}];

  },

  cityName() {
    game = Template.instance().gameInfo.get()
    nameDict = {
      "red-city": "Red City",
      "green-city": "Green City",
      "yellow-city": "Yellow City",
      "pink-city": "Pink City",
      "blue-city": "Blue City",
    }
    colorDict = {
      "red-city": "red",
      "green-city": "green",
      "yellow-city": "#ffc107",
      "pink-city": "#ff5cbe",
      "blue-city": "blue",
    }
    retDict = {
      "name": nameDict[game.group],
      "color": colorDict[game.group]
    }
    console.log(retDict);
    return retDict;
  },

  otherPlayers() {
    gCode = FlowRouter.getParam("gameCode");
    thisGame = Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": gCode}]});
    thisGroup = thisGame.group;
    // console.log(thisGame);
    return Games.find({$and: [{"gameCode": gCode}, {"role": {$in: ["base", "player"]}}, {"group": {$ne: thisGroup}}]}, {$sort: {"group": 1}}  );
  },

});

Template.trade.events({
  'submit .trade' (event, instance) {
    gCode = FlowRouter.getParam("gameCode");
    event.preventDefault();
    val = event.target.amount.value;
    res = event.target["resource"].value;
    // from = event.target["from-city"].value;
    // fromPlayer = Meteor.userId();
    // fromGroup =  Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": gCode}]}).group;
    from =  Games.findOne({$and: [{"playerId": Meteor.userId()}, {"gameCode": gCode}]});
    to = Games.findOne({"_id": event.target["to-city"].value});
    if (val == "" || event.target["to-city"].value == "") {
      console.log("empty val");
    }
    else {
      TradeResources.call({"amount": parseInt(val), "resource": res, "from": from, "to": to}, (err, res) => {
        if (err) {
          alert(err.error);
          console.log(err);
        } else {
          alert("Sent!");
        }
      });
    }
    // console.log(event.target["to-city"].value);
    
  }
  
});
