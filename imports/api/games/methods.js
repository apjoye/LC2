import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Games } from './games.js';

import { Resources } from '../links/links.js';

export const neighboringResourceEval = (building) => {
    // No point in proceeding there is no neighbor need.
    if ("neighborNeed" in building === false) {
        return true;
    }
    
    if ("neighboringResource" in building) {
        nres =  Resources.findOne({"_id": building["neighboringResource"]});
        if (nres["stats"][building["neighborUse"]["res"]] >= building["neighborUse"]["amount"]) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export const costEval = (resources, cost) => {
    for (r in cost) {
        if (cost[r] < resources[r]) {
            resources[r] = resources[r] - cost[r];
        } else {
            // need to be able to afford the whole cost
            return false
        }
    }
    return resources
}

Meteor.methods({
    'games.bids.update'(gameCode, commitState) {
        check(gameCode, String)
        check(commitState, Boolean)

        if (!this.isSimulation) {
            const baseId = Meteor.userId();
            if (commitState == true) {
                console.log("truing ready");
                Games.update(
                    {$and: [
                        {"gameCode": gameCode}, 
                        {"role": "base"}
                    ]}, 
                    {$addToSet: {"readyCities": baseId}}, 
                    {multi: true}
                );
            } else {
                Games.update(
                    {$and: [
                        {"gameCode": gameCode}, 
                        {"role": "base"}
                    ]}, 
                    {$pull: {"readyCities": baseId}}, 
                    {multi: true}
                ); 
            }
            Games.update(
                {$and: [
                    {"gameCode": gameCode}, 
                    {"role": "base"}, 
                    {"playerId": baseId}
                ]}, {$set: {"bidCommit": commitState}}
            );
        }
    },
    'games.building.affordability'(game, resources, building) {
        check(game, Object)
        check(resources, Object)
        check(building, Object)
        
        const neighborResourceCheckResult = neighboringResourceEval(building);
        const costEvaluationResult = costEval(resources, building['prodCost']);

        if (!neighborResourceCheckResult || !costEvaluationResult) {
            game["notes"].push(building.name + " was unaffordable and did not run");
            return false;
        } else {
            return costEvaluationResult;
        }
    }
});