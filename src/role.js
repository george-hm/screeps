const lib = require('lib');

class Role {
    /**
     *
     * @param {Creep} creep
     * @param {String} role
     * @memberof Role
     */
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
     * @param {String|Structure[]} destination - Where to go
     * @param {Boolean} fast - If we should caclulate shortest path (INCREASED CPU)
     * @return {Number} Creep.moveTo response
     * @memberof Role
     */
    moveTo(destination, fast) {
        let finalDestination = destination;
        switch (true) {
            // object id, just go
            case typeof finalDestination === 'string':
                finalDestination = lib.getObjectById(finalDestination);
                break;

            // array of nodes, pick best one
            case Array.isArray(finalDestination):
                finalDestination = lib.findOneNode(this.creep, finalDestination, fast);
                break;

            // this is probably a node itself
            default:
                break;
        }

        return this.creep.moveTo(finalDestination);
    }
}

module.exports = Role;
