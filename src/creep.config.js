/**
 * Template for how many creeps we need, want and their structure
 *
 */
module.exports = {
    gatherer: {
        priority: 1,
        min: 1,
        max: 2,
        parts: [WORK, WORK, WORK, WORK, WORK, MOVE],
    },
    hauler: {
        priority: 2,
        min: 1,
        max: 3,
        parts: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
    },
    builder: {
        priority: 3,
        min: 1,
        max: 3,
        parts: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    },
};
