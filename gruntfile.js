module.exports = function (grunt) {

    var gruntConfig = {
        concat: {
            options: {
                sourceMap: true
            },
            js: {
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
            },
             css: {
                src: [
                    'css/sources/**/*.css'
                ],
                dest: 'css/dist/combined.css'
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
    };

    grunt.initConfig(gruntConfig);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-babel');

    grunt.task.registerTask("configureBabelSourceMap", "configures babel source map", function () {
        gruntConfig.babel.options.inputSourceMap = grunt.file.readJSON('js/dist/combined.js.map');
    });
    
    grunt.registerTask('default', ['concat:js','concat:css','configureBabelSourceMap', 'babel']);
};