// import { Meteor } from 'meteor/meteor';
import './home.html';
import { Games } from '/imports/api/links/links.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../components/navbar/navbar.js';

import '../../components/hello/hello.js';
import '../../components/card/card.js';
import '../../components/city/city.js';
import '../../components/trade/trade.js';
import '../../components/info/info.js';
// import '../../components/hello/hello.js';
// import '../../stylesheets/bootstrap.css';

import '../../components/admin/admin.js';
import '../../components/central/central.js';

Template.App_home.helpers({
  // player() {
  //   console.log(Meteor.user());
  //   return true;
  // },

  isAdmin() {
    return Meteor.user().profile.name == "boss";
  }
})

Template.gameView.helpers({
  isAdmin() {
    return Meteor.user().profile.name == "boss";
  },

  isRole(role) {
    gameCode = FlowRouter.current().params.gameCode;
    game = Games.findOne({$and: [{"gameCode": gameCode}, {"playerId": Meteor.userId()}]})
    // console.log(role);
    if (game != undefined){
      // console.log(game);
      if (game.role == role){
        // console.log(role + " confirmed");
        return true;  
      }
      else {
        return false;
      }
    }
    else {
      // return false;
      // console.log("game not found");
      FlowRouter.go('home');
      return false;
    }
    
  }
})