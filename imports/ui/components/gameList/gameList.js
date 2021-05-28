import './gameList.html';
import { Producers } from '/imports/api/links/links.js';
// import { Assets } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
// import { NewRound } from '/imports/api/links/methods.js';
// import { StartGame } from '/imports/api/links/methods.js';
import { Games } from '/imports/api/games/games.js';

Template.gameList.onCreated(function helloOnCreated() {
  Meteor.subscribe('games.minerunning');
});

Template.gameList.helpers({
  userGames() {
    return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "running"}]});
  },

  gameSize() {
    // console.log(Meteor.userId());
    // console.log(Games.find({"playerId": Meteor.userId()}).fetch());
    sizeText = ""
    if (this.groupList != undefined) {
      sizeText = ": " + this.groupList.length + " cities";
    }
    return sizeText;

    // return Games.find({});
  }
});
