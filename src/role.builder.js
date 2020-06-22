const Role = require('role');
const lib = require('lib');

class Builder extends Role {
    constructor(creep) {
        super(creep, 'builder');
    }

    run() {
        if (this.creep.store.getUsedCapacity() < 30) {
            lib.requestResources(this.creep);
        }

        let node;
        if (this.creep.memory.assignment) {
            node = lib.getObjectById(this.creep.memory.assignment);
            if (!node) {
                lib.unassign(this.creep);
            }
        }

        node = node || lib.findOneNode(this.creep, FIND_MY_CONSTRUCTION_SITES) || this.creep.room.controller;

        if (!node) {
            this.creep.say('No build!');
            lib.unassign(this.creep);
            return;
        }

        // we dont want an assignment limit on controller
        if (node.structureType !== STRUCTURE_CONTROLLER) {
            // its ok to assume assign returns true since we just found an unassigned node
            lib.assign(this.creep, node);
        }

        this.build(node);
    }

    /**
     * @param {Structure|StructureController} target
     * @returns
     * @memberof Builder
     */
    build(target) {
        const result = target instanceof StructureController ?
            this.creep.upgradeController(target) :
            this.creep.build(target);

        switch (result) {
            case ERR_NOT_ENOUGH_RESOURCES:
            case OK:
                return true;

            case ERR_NOT_IN_RANGE:
                this.moveTo(target);
                return true;

            default:
                console.log(`unknown response for role.worker.build: ${result}`);
                return true;
        }
    }
}

module.exports = Builder;
