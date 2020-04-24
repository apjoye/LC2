// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Links } from '../links.js';
import { Producers } from '../links.js';
import { Cities } from '../links.js';
import { Games } from '../links.js';
import { Bids } from '../links.js';
import { Acts } from '../links.js';
import { Maps } from '../links.js';
import { Resources } from '../links.js';
import { Buildings } from '../links.js';
import { Assets } from '../links.js';


Meteor.publish('links.all', function () {
  return Links.find();
});

Meteor.publish('producers.public', function () {
  return Producers.find({$and: [{"owned": false}, {"visible": true}]});
});

Meteor.publish('producers.owned', function () {
  return Producers.find({"ownerId": Meteor.userId()});
  //figure this shit out
  // if (!this.userId) {
  //   return this.ready();
  // }

  // return Producers.find({
  //   userId: 
  // })
});

Meteor.publish('producers.all', function () {
  return Producers.find();
});

Meteor.publish('cities.all', function () {
	return Cities.find();
});

Meteor.publish('assets.all', function () {
  return Assets.find();
});

Meteor.publish('buildings.thisGame', function (gameCode) {
  // console.log(this.users());
  return Buildings.find({$and: [{"gameCode": gameCode }]});
});

Meteor.publish('buildings.auction', function (gameCode) {
  // console.log(this.users());
  return Buildings.find({$and: [{"gameCode": gameCode }, {"state": "auction"} ] } );
});


Meteor.publish('buildings.city', function (gameCode) {
  // console.log(this.users());
  return Buildings.find({$and: [{"gameCode": gameCode }, {"ownerId": Meteor.userId()} ] } );
});


Meteor.publish('resources.thisGame', function (gameCode) {
  // console.log(this.users());
  return Resources.find({$and: [{"gameCode": gameCode }]});
});

Meteor.publish('maps.thisGame', function (gameCode) {
  // console.log(this.users());
  return Maps.find({$and: [{"gameCode": gameCode }]});
});


Meteor.publish('games.minerunning', function () {
  // console.log(this.users());
  return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "running"}]});
});

Meteor.publish('games.minepaused', function () {
  // console.log(this.users());
  return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "paused"}]});
});

Meteor.publish('games.mine', function () {
  // console.log(this.users());
  return Games.find({$and: [{"playerId": Meteor.userId()}]});
});

Meteor.publish('games.paused', function () {
  // console.log(this.users());
  return Games.find({$and: [{"status": "paused"}]});
});

Meteor.publish('games.running', function () {
  // console.log(this.users());
  return Games.find({$and: [{"status": "running"}]});
});

Meteor.publish('games.all', function () {
  // console.log(this.users());
  return Games.find({$and: [{"status": "running"}]});
});

Meteor.publish('games.users', function (gameCode) {
  // console.log(this.users());
  return Games.find({$and: [{"status": "running"}, {"gameCode": gameCode}]});
});

Meteor.publish('bids.all', function () {
  // console.log(this.users());
  return Bids.find({});
});

Meteor.publish('bids.local', function () {
  // console.log(this.users());
  return Bids.find({"baseId": Meteor.userId()});
});

Meteor.publish('acts.game', function (gameCode) {
  return Acts.find({"gameCode": gameCode});
});


