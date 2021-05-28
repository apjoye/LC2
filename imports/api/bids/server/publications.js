import { Meteor } from 'meteor/meteor';
import { Bids } from '../bids.js';

Meteor.publish('bids.all', function () {
    return Bids.find({});
});
  
Meteor.publish('bids.local', function () {
    return Bids.find({"baseId": Meteor.userId()});
});