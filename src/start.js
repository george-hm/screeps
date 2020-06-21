const Tower = require('tower');
const spawnCreeps = require('creep.spawn');
const roleList = require('roleList');
const lib = require('lib');

/**
 * This handles what should be ran at the start of every tick
 *
 * @class Start
 */
class Start {
    /**
     * Run the Start sequence
     *
     * Runs through everything we need to in 1 tick
     *
     * @memberof Start
     */
    static init() {
        this._startMemory();
        const shouldCheck = Memory.checkIn <= Game.time;

        // reset memory and spawn new creeps
        if (shouldCheck) {
            this._cleanMemory();
            for (const spawnName in Game.spawns) {
                const spawner = Game.spawns[spawnName];
                spawnCreeps(spawner);
            }

            // checkin should be 10 ticks from now
            Memory.checkIn = Game.time + 10;
        }

        Start.runCreeps();

        // tell tower to defend (more in future)
        for (const structureHash in Game.structures) {
            const struct = Game.structures[structureHash];
            if (struct.structureType !== STRUCTURE_TOWER) {
                continue;
            }

            new Tower(struct);
        }
    }

    /**
     * Cleans up all our memory
     * our memory can get 'dirty' when creeps die, leaving
     * empty or useless objects in Memory, this method
     * cleans it all up for us
     *
     * @static
     * @memberof Start
     */
    static _cleanMemory() {
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
     * @memberof Start
     */
    static runCreeps() {
        const creepList = Game.creeps;
        for (const creepName in creepList) {
            const currentCreep = creepList[creepName];

            if (!currentCreep) {
                delete creepList[creepName];
                continue;
            }

            if (currentCreep.spawning) {
                continue;
            }

            const creepRoleClass = roleList[currentCreep.memory.role];
            if (creepRoleClass) {
                new creepRoleClass(currentCreep);
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
