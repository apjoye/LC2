// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Links } from '../../api/links/links.js';
import { Games, Buildings, Acts, Bids, Resources, Maps } from '../../api/links/links.js';
import { baseUsers } from '../both/index.js';

basePass = "battery-honey";
export const cityStart = {"res": {"m1": 2, "m2": 2, "f1": 2, "f2": 2}, "pollution": 0, "population": 5, "happiness": 5};

Meteor.startup(() => {
  
  //setup base station users
  // setupBaseUsers: function () {
  if (Meteor.users.findOne({"username": baseUsers[0]}) == undefined) {
    for (uname in baseUsers){
      Accounts.createUser({
        username: baseUsers[uname],
        email : baseUsers[uname] + "@base.com",
        password : basePass,
        profile  : {
            //publicly visible fields like firstname goes here
            "name": baseUsers[uname],
            "lastname": uname
        }
      });
    }
    Accounts.createUser({
      username: "boss",
      email : "boss@boss.com",
      password : "abcdefgh",
      profile  : {
          //publicly visible fields like firstname goes here
          "name": "boss",
          "lastname": "man"
      }
    });
  }

  Buildings.rawCollection().createIndex({"gameCode": 1});
  Buildings.rawCollection().createIndex({"gameCode": 1, "ownerId": 1});
  Bids.rawCollection().createIndex({"gameCode": 1, "buildingId": 1, "baseId": 1});
  Bids.rawCollection().createIndex({"gameCode": 1, "buildingId": 1});
  Games.rawCollection().createIndex({"gameCode": 1});
  Acts.rawCollection().createIndex({"gameCode": 1, "key": 1});
  // }
  // add running field to producer
  // Producers.update({"running": {$exists: false}}, {$set: {"running": true}}, {multi: true});

});
