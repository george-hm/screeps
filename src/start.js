const Tower = require('tower');
const spawnCreeps = require('creep.spawn');
const roleList = require('roleList');
const lib = require('lib');

/**
 * This handles what should be ran at the start of every tick
 *
 * @class Sequence
 */
class Start {
    /**
     * Run the Sequence sequence
     *
     * Runs through everything we need to in 1 tick
     *
     * @memberof Sequence
     */
    static init() {
        this._startMemory();
        const shouldCheck = Memory.checkIn <= Game.time;

        // reset memory and spawn new creeps
        if (shouldCheck) {
            this._resetMemory();
            for (const spawnName in Game.spawns) {
                const spawner = Game.spawns[spawnName];
                spawnCreeps(spawner);
            }

            // checkin should be 10 ticks from now
            Memory.checkIn = Game.time + 10;
        }

        // go through all creeps in memory
        const creepList = Memory.creeps;
        for (const creepName in creepList) {
            const creep = Game.creeps[creepName];

            // it's a dead creep, clean memory
            if (!creep) {
                delete creepList[creepName];
                continue;
            }

            if (creep.spawning) {
                continue;
            }

            const roleClass = roleList[creep.memory.role];
            if (roleClass) {
                // give the creep its role to do
                new roleClass(creep);
            }
        }

        for (const structureHash in Game.structures) {
            const struct = Game.structures[structureHash];
            if (struct.structureType !== STRUCTURE_TOWER) {
                continue;
            }

            new Tower(struct);
        }
    }

    static _resetMemory() {
        for (const nodeId in Memory.assignments) {
            const nodeAssignments = Memory.assignments[nodeId];

            // its a node with no assignments, clean up memory
            if (!Object.keys(nodeAssignments).length) {
                delete Memory.assignments[nodeId];
                continue;
            }

            for (const creepName in nodeAssignments) {
                if (!Game.creeps[creepName]) {
                    delete Memory.assignments[nodeId][creepName];
                }
            }
        }
    }

    /**
     * Go through all creeps, and tell them to do their assigned task
     *
     * @memberof Sequence
     */
    static _runCreeps() {
        const creepList = Game.creeps;
        for (const creepName in creepList) {
            const creep = creepList[creepName];
            if (creep.spawning) {
                continue;
            }

            let roleClass = roleList[creep.memory.role];
            if (roleClass) {
                roleClass = new roleClass(creep);
            }
        }
    }

    /**
     * Sets global memory that needs to be assigned
     *
     */
    static _startMemory() {
        lib.cache = {};
        Memory.checkIn = Memory.checkIn ? Memory.checkIn : Game.time;
        Memory.assignments = Memory.assignments ? Memory.assignments : {};
        Memory.requests = Memory.requests ? Memory.requests : {};
    }
}

module.exports = Start;
