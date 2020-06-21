const lib = require('lib');

class Role {

    constructor(creep, role) {
        this.creep = creep;
        creep.memory.role = role;
        this._role = role;
        if (!this.creep.memory[this._role]) {
            this.creep.memory[this._role] = {};
        }
    }

    /**
     * Move to something.
     *
     * Destination can be either:
     * - An object id
     * - An array of nodes (checks assignments)
     * - A node
     *
     * @param {*} destination - Where to go
     * @param {boolean} fast - If we should caclulate shortest path (INCREASED CPU)
     * @return {number} Creep.moveTo response
     * @memberof Role
     */
    moveTo(destination, fast) {
        switch (true) {
            // object id, just go
            case typeof destination === 'string':
                destination = lib.getObjectById(destination);
                break;

            // array of nodes, pick best one
            case Array.isArray(destination):
                destination = lib.findOneNode(this.creep, destination, fast);
                break;

            // this is probably a node itself
            default:
                destination = destination;
                break;
        }

        return this.creep.moveTo(destination);
    }
}

module.exports = Role;
