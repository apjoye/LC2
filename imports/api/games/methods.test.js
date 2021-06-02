import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'chai';
// import faker from 'faker';

import { costEval, neighboringResourceEval } from './methods.js'
import { Buildings, Resources } from '../links/links.js'

// TODO::move factories to a dedicated location
Factory.define('resource', Resources, {
    stats: { copper: 3 }
});

Factory.define('building', Buildings, {
    neighborUse: { res: 'copper', amount: 2 }
});

if (Meteor.isServer) {
    describe('cost eval', function () {
        it('cost is affordable', function () {
            assert.deepEqual(
                costEval(
                    { lumber: 8, clay: 8, copper: 8, food: 8 },
                    { lumber: 2, clay: 0, copper: 0, food: 2 },
                ),
                { lumber: 6, clay: 8, copper: 8, food: 6 }
            );
        });
        it('cost is not affordable', function () {
            assert.equal(
                costEval(
                    { lumber: 0, clay: 0, copper: 0, food: 5 },
                    { lumber: 2, clay: 0, copper: 0, food: 2 },
                ),
                false
            );
        });
    });

    describe('neighboring resource check', function () {
        it('there is no neighbor need', function () {
            const building = Factory.build('building');
            assert.equal(
                neighboringResourceEval(building),
                true
            );
        });
        it('there is a need but no potential resources', function () {
            const building = Factory.extend('building', { neighborNeed: {} });
            assert.equal(
                neighboringResourceEval(building),
                false
            )
        });
        it('there is a need, there are potential resources, but not the required amount', function () {
            const resource = Factory.create('resource', {stats: { copper: 1}});
            const building = Factory.extend(
                'building', 
                { neighborNeed: {}, neighboringResource: resource._id }
            );
            // building.neighborUse.amount = 1;
            assert.equal(
                neighboringResourceEval(building),
                false
            )
        });
        it('there is a need, there are potential resources, and the required amount', function () {
            const resource = Factory.create('resource');
            const building = Factory.extend(
                'building', 
                { neighborNeed: {}, neighboringResource: resource._id }
            );
            assert.equal(
                neighboringResourceEval(building),
                true
            )
        });
    });
}
