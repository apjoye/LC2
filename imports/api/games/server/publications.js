import { Meteor } from 'meteor/meteor';
import { Games } from '../games.js';

Meteor.publish('games.minerunning', function () {
    return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "running"}]});
});

Meteor.publish('games.minepaused', function () {
    return Games.find({$and: [{"playerId": Meteor.userId()}, {"status": "paused"}]});
});

Meteor.publish('games.mine', function () {
    return Games.find({$and: [{"playerId": Meteor.userId()}]});
});

Meteor.publish('games.paused', function () {
    return Games.find({$and: [{"status": "paused"}]});
});

Meteor.publish('games.running', function () {
    return Games.find({$and: [{"status": "running"}]});
});

Meteor.publish('games.all', function () {
    return Games.find({$and: [{"status": "running"}]});
});

Meteor.publish('games.users', function (gameCode) {
    return Games.find({$and: [{"status": "running"}, {"gameCode": gameCode}]});
});