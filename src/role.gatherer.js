const Role = require('role');
const lib = require('lib');

class Gatherer extends Role {
    constructor(creep) {
        super(creep, 'gatherer');
    }

    run() {
        let node = this.creep.memory.assignment || lib.findOneNode(this.creep, FIND_SOURCES_ACTIVE, true, 1);
        if (!node) {
            this.creep.say('Nodes full');
            return;
        }
        if (typeof node === 'string') {
            node = lib.getObjectById(node);
        }
        if (!this.creep.memory.assignment) {
            lib.assign(this.creep, node);
        }
        const harvestResult = this.creep.harvest(node);
        switch (harvestResult) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(node);
                break;
            default:
                console.log(`${this.creep.name}: Unknown harvest response: ${harvestResult}`);
                lib.unassign(this.creep);
                break;
        }
    }
}

module.exports = Gatherer;
