const Role = require('role');
const lib = require('lib');

class RemoteGatherer extends Role {
    constructor(creep) {
        super(creep, 'remoteGatherer');
        this.run();
    }

    run() {
        const nodeList = Memory.remoteTargets;
        if (!nodeList || !nodeList.length) {
            Memory.remoteTargets = [];
            console.log('Set node IDs in Memory.remoteTarget!');
        }

        const node = lib.getObjectById(this.creep.memory.assignment) || lib.findOneNode(
            this.creep,
            nodeList.map(currentNode => lib.getObjectById(currentNode) || null).filter(_ => _),
            false,
            1,
        );

        if (!node) {
            this.goRemote();
            return;
        }

        lib.assign(this.creep, node);

        const result = this.creep.harvest(node);
        switch (result) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                this.creep.moveTo(node);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                lib.unassign(this.creep);
                break;
            default:
                console.log(`Unknown remote creep.harvest response: ${result}`);
                break;
        }
    }

    goRemote() {
        const remoteRoom = new RoomObject(
            Memory.remoteRoom.x,
            Memory.remoteRoom.y,
            Memory.remoteRoom.roomName,
        );
        return this.creep.moveTo(remoteRoom);
    }
}

module.exports = RemoteGatherer;
