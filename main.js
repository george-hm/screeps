const start = require('start');

module.exports.loop = () => {
    console.log(`${Game.time % 2 ? 'Tick' : 'Tock'}: ${Game.time}`);
    start.init();
};
