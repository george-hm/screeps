const Role = require('role');
const lib = require('lib');

class Hauler extends Role {
    constructor(creep) {
        super(creep, 'hauler');
    }

    run() {
        const { transfer } = this.creep.memory;
        if (this.creep.store.getFreeCapacity() && !transfer) {
            return this.collect();
        }

        return this.transfer();
    }

    /**
     * Goes to collect energy either dropped or from a container
     *
     * @memberof Hauler
     */
    collect() {
        if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.transfer();
            return;
        }

        let target;
        if (this.creep.memory.assignment) {
            target = Game.getObjectById(this.creep.memory.assignment);
        } else {
            target = this.getCollectionTarget();
        }

        if (!target) {
            this.goHome();
            return;
        }

        lib.assign(this.creep, target);

        this.creep.say(target.structureType || target.resourceType);
        const result = target.structureType ?
            this.creep.withdraw(target, RESOURCE_ENERGY) :
            this.creep.pickup(target);

        switch (result) {
            case OK:
                lib.unassign(this.creep);
                return;

            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(target);
                break;

            case ERR_FULL:
            case ERR_NOT_ENOUGH_RESOURCES:
                lib.unassign(this.creep);
                break;

            default:
                lib.unassign(this.creep);
                console.log(`Unknown hauler.collect response: ${result}`);
                break;
        }
    }

    /**
     * Transfers carried energy to a creep/structure
     *
     * @memberof Hauler
     */
    transfer() {
        if (this.creep.store.getUsedCapacity() === 0) {
            this.creep.memory.transfer = false;
            this.collect();
            return;
        }
        this.creep.memory.transfer = true;
        const target = lib.getObjectById(this.creep.memory.assignment) ||
            this.getTransferTarget() || // structures/extensions etc...
            lib.getRequest(this.creep); // a creep/tower requested resources

        if (!target) {
            lib.unassign(this.creep);
            if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                this.creep.memory.transfer = false;
                this.collect();
                return;
            }

            this.goHome();
            return;
        }

        if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            lib.unassign(this.creep);
            this.transfer();
            return;
        }

        lib.assign(this.creep, target);

        this.creep.say(target.name ? (target.memory.role || target.structureType) : target.structureType);
        const result = this.creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                lib.unassign(this.creep);
                break;

            case ERR_NOT_IN_RANGE:
                this.creep.memory.transfer = true;
                this.moveTo(target);
                break;

            case ERR_FULL:
                lib.unassign(this.creep);
                break;

            default:
                // weird response, unassign so we get a new target
                lib.unassign(this.creep);
                console.log(`${this.creep.name} hauler.transfer unexpected response: ${result}`);
                break;
        }
    }

    /**
     * Gets structures where it has space for energy
     *
     * @returns {Structure[]}  the structures found
     * @memberof Hauler
     */
    getTransferTarget() {
        const structures = lib.findNodes(this.creep, FIND_MY_STRUCTURES);
        const destinations = structures.filter(struct => {
            if (![STRUCTURE_SPAWN, STRUCTURE_EXTENSION].includes(struct.structureType)) {
                return false;
            }
            if (struct.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                return false;
            }
            return true;
        });

        return lib.findOneNode(this.creep, destinations, false, 1);
    }

    /**
     * Get a target to collect energy from
     *
     * @returns {Structure|Resource} The energy/structure to collect from
     * @memberof Hauler
     */
    getCollectionTarget() {
        const droppedEnergy = lib.findNodes(
            this.creep,
            FIND_DROPPED_RESOURCES,
        ).filter(resource => resource.resourceType === RESOURCE_ENERGY && resource.amount >= 100);

        let target = lib.findOneNode(
            this.creep,
            droppedEnergy,
            false,
            1,
        );

        // look for structures instead
        if (!target) {
            const availableStructures = lib.findNodes(
                this.creep,
                FIND_STRUCTURES,
            ).filter(struct => struct.structureType === STRUCTURE_CONTAINER)
                .sort((a, b) => b.store.getUsedCapacity(RESOURCE_ENERGY) - a.store.getUsedCapacity(RESOURCE_ENERGY));

            target = lib.findOneNode(
                this.creep,
                availableStructures,
                false,
                3,
            );
        }

        return target || null;
    }

    /**
     * Goes to spawn, or the first flag available
     *
     * @returns {number}  response from creep.moveTo
     * @memberof Hauler
     */
    goHome() {
        lib.unassign(this.creep);
        const firstFlag = lib.findNodes(this.creep, FIND_FLAGS).map(flag => flag.pos)[0];
        if (firstFlag) {
            return this.creep.moveTo(firstFlag);
        }
        const home = lib.findNodes(this.creep, FIND_MY_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_SPAWN)[0];
        return this.creep.moveTo(home);
    }
}

module.exports = Hauler;
