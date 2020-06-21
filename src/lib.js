class Lib {
    /**
     * Finds one node which is not at full
     * assignment capacity
     *
     * @static
     * @param {Structure} item A item
     * @param {Structure[]|FindConstant} targets  A find (FIND_SOURCES_ACTIVE) or an array of nodes
     * @param {Boolean} fast If we should use quick pathfinding (USES MORE CPU)
     * @param {Number} max The maximum number of assignments for targets
     * @returns The node, or null
     * @memberof Lib
     */
    static findOneNode(item, targets, fast, max) {
        const nodes = Array.isArray(targets) ? targets : this.findNodes(item, targets);

        /**
         * Filter out structures so that we only get
         * structures which are avilable to be assigned
         *
         * @param {Structure} struct
         * @returns
         */
        function filter(struct) {
            if (!Memory.assignments[struct.id]) {
                Memory.assignments[struct.id] = {};
            }

            return Object.keys(Memory.assignments[struct.id]).length < (max || Lib.MAX_PER_NODE);
        }
        let ret;
        if (fast) {
            ret = item.pos.findClosestByRange(
                nodes,
                {
                    filter,
                },
            ) || null;
        } else {
            [ret] = nodes.filter(filter);
        }

        return ret || null;
    }

    /**
     * Find nodes, just like the room.find method except
     * we should be using this as it caches
     *
     * @static
     * @param {Creep|Structure} item  An item (creep/tower)
     * @param {FindConstant} type  The type to find e.g. FIND_SOURCES_ACTIVE
     * @returns
     * @memberof Lib
     */
    static findNodes(item, type) {
        const result = Lib.cache[type] || item.room.find(type);

        Lib.cache[type] = result;

        return result;
    }

    /**
     * Assign an item to a node
     * Reassigns if already assigned
     *
     * @param {Creep} creep
     * @param {Structure} node
     * @returns {Boolean}  true if assigned, false if can't assign
     * @memberof Lib
     */
    static assign(creep, node) {
        if (!node || !node.id) {
            return false;
        }

        Lib.unassign(creep);

        if (!Memory.assignments[node.id]) {
            Memory.assignments[node.id] = {};
        }

        if (Object.keys(Memory.assignments[node.id]).length >= Lib.MAX_PER_NODE) {
            return false;
        }

        Memory.assignments[node.id][creep.name] = 1;
        creep.memory.assignment = node.id;
        return true;
    }

    /**
     * Unassigns a item, both from the item and its node.
     *
     * Does nothing if not already assigned
     *
     * @param {Creep} creep  The item to unassign
     * @memberof Lib
     */
    static unassign(creep) {
        const nodeId = creep.memory.assignment;
        creep.memory.assignment = null;

        if (nodeId && Memory.assignments[nodeId]) {
            delete Memory.assignments[nodeId][creep.name];
        }
    }

    /**
     * To be used in place of Game.getObjectById
     *
     * Result gets cached
     *
     * @static
     * @param {string} id
     * @memberof Lib
     */
    static getObjectById(id) {
        if (Lib.cache[id]) {
            return Lib.cache[id];
        }
        Lib.cache[id] = Game.getObjectById(id);
        return Lib.cache[id];
    }

    /**
     * Put in a request for energy
     *
     * @static
     * @param {Creep|StructureTower} item
     * @memberof Lib
     */
    static requestResources(item) {
        // put our room name in Memory.requests
        Memory.requests[item.room.name] = Memory.requests[item.room.name] ?
            Memory.requests[item.room.name] :
            {};

        Memory.requests[item.room.name][item.id] = item.store.getFreeCapacity(RESOURCE_ENERGY);
    }

    /**
     * Gets a request which was generated from requestResources
     *
     * @static
     * @param {Creep} creep
     * @returns
     * @memberof Lib
     */
    static getRequest(creep) {
        const requests = Memory.requests[creep.room.name];
        for (const objectId in requests) {
            // we are handling the request, delete it so we don't
            // handle it ever again
            delete Memory.requests[creep.room.name][objectId];

            if (Lib.getObjectById(objectId)) {
                return Lib.getObjectById(objectId);
            }
        }

        return null;
    }
}

Lib.MAX_PER_NODE = 2;
Lib.cache = {};

module.exports = Lib;
