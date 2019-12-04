import './admin.html';
import '../gameList/gameList.js';
import { Producers } from '/imports/api/links/links.js';
// import { Assets } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';

import { ChangeStat } from '/imports/api/links/methods.js';
import { NewRound } from '/imports/api/links/methods.js';
import { StartGame } from '/imports/api/links/methods.js';
import { ToggleGameRunning } from '/imports/api/links/methods.js';
import { ChangeTeam } from '/imports/api/links/methods.js';
import { MakeBase } from '/imports/api/links/methods.js';
import { AddNeighbor } from '/imports/api/links/methods.js';
import { RunBids } from '/imports/api/links/methods.js';
import { AsyncTest } from '/imports/api/links/methods.js';
// import {}

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