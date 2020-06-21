const config = require('./config.json');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: 'default',
                ptr: false,
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.{js,wasm}'],
                        flatten: true,
                    },
                ],
            },
        },
    });
};
