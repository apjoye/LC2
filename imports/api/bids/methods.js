import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Bids } from './bids.js'

Meteor.methods({
    'bids.afford'(bidId, affordability) {
        check(bidId, String);
        check(affordability, Boolean);

        if (!this.isSimulation) {
            Bids.update(
                {"_id": bidId}, 
                {$set: {"affordability": affordability}}
            );
            return true;
        }
    },
    // add these back, overkill
    'bids.producer'(producer) {
        check(producer, String);

        return Bids.findOne({"producer": producer});
    },
    'bids.city'(gameCode) {
        check(gameCode, String);
        
        return Bids.find(
            {$and: [
                {"gameCode": gameCode}, 
                {"baseId": Meteor.userId()}
            ]}
        ).fetch()
    },
});