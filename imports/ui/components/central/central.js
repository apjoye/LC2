import './central.html';
import { Meteor } from 'meteor/meteor';
// import { Cities } from '/imports/api/links/links.js';
import { Games } from '/imports/api/links/links.js';
import { Acts } from '/imports/api/links/links.js';
// import d3 from 'd3';


// Template.body.onRendered(function () {
//   d3.select('#d3-container').append('<h1>hello kitty</h1>');
// })

// import { TradeResources } from '/imports/api/links/methods.js';
// import { ResetAll } from '/imports/api/links/methods.js';

Template.cityStates.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
  Meteor.subscribe('games.all');
  Meteor.subscribe('acts.game', FlowRouter.getParam('gameCode'));
  // Meteor.subscribe('producers.all');

});

Template.cityStates.onRendered(function () {
  // d3.select('#d3-container').append('<h1>hello kitty</h1>');
  

});

Template.cityStates.helpers({
  cities() {
    return Games.find({$and:[{"gameCode": FlowRouter.getParam('gameCode')}, {"role": "base"}]});
  },

  logs() {
    // console.log(Acts.find({"key": "tradeResource"}, {sort: {"time": -1}}).fetch()[0]);
    tradeActs = Acts.find({$and: [{"key": "tradeResource"}, {"success": true}]}, {sort: {"time": -1}});
    console.log(tradeActs.fetch());
    return tradeActs;
  }
});