module.exports = function (grunt) {

    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'js/sources/Global/modules.js',
                    'js/sources/Global/settings.js',
                    'js/sources/Global/functions.js',
                    'js/sources/Global/ng-modules.js',
                    'js/sources/Filters/**/*.js',
                    'js/sources/Services/**/*.js',
                    'js/sources/Controllers/**/*.js',
                    'js/sources/Directives/**/*.js',
                    ],
                dest: 'js/dist/combined.js'
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: [
                    "es2015"
                ],
                plugins: [
                    "syntax-async-functions",
                    "transform-regenerator"
                ]
            },
            dist: {
                files: {
                    'js/dist/compiled.js': 'js/dist/combined.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-babel');
    grunt.registerTask('default', ['concat', 'babel']);

};