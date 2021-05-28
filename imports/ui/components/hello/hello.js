import './hello.html';
import '../gameList/gameList.js';
import { JoinGame } from '/imports/api/links/methods.js';

Template.gameStart.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  // Meteor.subscribe('games.running');
});

Template.gameStart.helpers({
  counter() {
    return Template.instance().counter.get();
  },

  
});

Template.gameStart.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
  
  'submit .gameChoice': function(event) {
    event.preventDefault();
    gCode = event.target.gameCode.value;
    JoinGame.call({
      "playerId": Meteor.userId(), 
      "playerName": Meteor.user().username, 
      "gameCode": gCode, 
      "role": "player"
    }, (err, res) => {
      if(err) {console.log(err);}
    });
  }  
});

// Template.gameList.onCreated(function helloOnCreated() {
//   // counter starts at 0
//   // this.counter = new ReactiveVar(0);
//   Meteor.subscribe('games.running');
// });

// Template.gameList.helpers({
//   userGames() {
//     console.log(Meteor.userId());
//     console.log(Games.find({"playerId": Meteor.userId()}).fetch());
//     return Games.find({});
//   }
// });
