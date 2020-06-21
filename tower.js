const lib = require('lib');

class Tower {
    constructor(tower) {
        this.tower = tower;

        if (this.tower.store.getUsedCapacity(RESOURCE_ENERGY) < (this.tower.store.getCapacity(RESOURCE_ENERGY) / 2)) {
            lib.requestResources(this.tower);
        }

        return this.defend() || this.heal() || this.repair();
    }

    defend() {
        const enemyCreeps = lib.findNodes(this.tower, FIND_HOSTILE_CREEPS);
        if (enemyCreeps.length === 0) {
            return false;
        }

        this.tower.attack(enemyCreeps[0]);
        return true;
    }

    heal() {
        const friendlyCreeps = lib.findNodes(this.tower, FIND_MY_CREEPS).filter(creep => creep.hits !== creep.hitsMax);
        if (friendlyCreeps.length === 0) {
            return false;
        }

        this.tower.heal(friendlyCreeps[0]);
        return true;
    }

    repair() {
        if (this.tower.store.getUsedCapacity(RESOURCE_ENERGY) < (this.tower.store.getCapacity(RESOURCE_ENERGY) * 0.4)) {
            return false;
        }

        const damagedStructures = lib.findNodes(this.tower, FIND_STRUCTURES)
            .filter(struct => {
                if (struct.structureType === STRUCTURE_WALL || struct.structureType === STRUCTURE_RAMPART) {
                    return struct.hits < 400000;
                }
                return struct.hits && (struct.hits < (struct.hitsMax * 0.60));
            })
            .sort((a, b) => a.hits - b.hits);

        if (damagedStructures.length === 0) {
            return false;
        }

        this.tower.repair(damagedStructures[0]);
        return true;
    }
}

module.exports = Tower;
