class Lib {
    /**
     * Finds one node which is not at full
     * assignment capacity
     *
     * @static
     * @param {item} item           A item
     * @param {any[]|number} targets  A find (FIND_SOURCES_ACTIVE) or an array of nodes
     * @param {boolean} fast          If we should use quick pathfinding (USES MORE CPU)
     * @returns The node, or null
     * @memberof Lib
     */
    static findOneNode(item, targets, fast, max) {
        const nodes = Array.isArray(targets) ? targets : this.findNodes(item, targets);

        const filter = struct => {
            if (!Memory.assignments[struct.id]) {
                Memory.assignments[struct.id] = {};
            }

            return Object.keys(Memory.assignments[struct.id]).length < (max || Lib.MAX_PER_NODE);
        };
        let ret;
        if (fast) {
            ret = item.pos.findClosestByRange(nodes, {
                filter,
            }) || null;
        } else {
            [ret] = nodes.filter(filter);
        }

        return ret || null;
    }

    /**
     * Find nodes, just like the room.find method
     *
     * If passed in name param, we cache this
     *
     * @static
     * @param {item} item  An item (creep/tower)
     * @param {number} type  The type to find e.g. FIND_SOURCES_ACTIVE
     * @param {string} name  Name to cache result as
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
     * @param {*} item
     * @param {Structure} node
     * @returns {boolean}  true if assigned, false if can't assign
     * @memberof Lib
     */
    static assign(item, node) {
        if (!node || !node.id) {
            return false;
        }

        Lib.unassign(item);

        if (!Memory.assignments[node.id]) {
            Memory.assignments[node.id] = {};
        }

        if (Object.keys(Memory.assignments[node.id]).length >= Lib.MAX_PER_NODE) {
            return false;
        }

        Memory.assignments[node.id][item.name] = 1;
        item.memory.assignment = node.id;
        return true;
    }

    /**
     * Unassigns a item, both from the item and its node.
     *
     * Does nothing if not already assigned
     *
     * @param {item} item  The item to unassign
     * @memberof Lib
     */
    static unassign(item) {
        const nodeId = item.memory.assignment;
        item.memory.assignment = null;

        if (nodeId && Memory.assignments[nodeId]) {
            delete Memory.assignments[nodeId][item.name];
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
     * @param {item} item
     * @memberof Lib
     */
    static requestResources(item) {
        Memory.requests[item.room.name] = Memory.requests[item.room.name] ? Memory.requests[item.room.name] : {};
        Memory.requests[item.room.name][item.name || item.id] = item.store.getFreeCapacity(RESOURCE_ENERGY);
    }

    static getRequest(creep) {
        const requests = Memory.requests[creep.room.name];
        for (const itemName in requests) {
            if (Game.creeps[itemName]) {
                // this request is going to be fulfilled, delete from memory (1 assignee only)
                delete Memory.requests[creep.room.name][itemName];
                return Game.creeps[itemName];
            } if (Lib.getObjectById(itemName)) {
                // this request is going to be fulfilled, delete from memory (1 assignee only)
                delete Memory.requests[creep.room.name][itemName];
                return Lib.getObjectById(itemName);
            }

            delete Memory.requests[creep.room.name][itemName];
        }

        return null;
    }
}

Lib.MAX_PER_NODE = 2;
Lib.cache = {};

module.exports = Lib;
