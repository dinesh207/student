module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        mangle: false,
        banner: '/* ========================================================= \n'
        +'! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n'+
        'Copyright (c) 2016 \n'+
        '========================================================= */\n'
      },
      my_target: {
        files: {
          'public/dest/app.min.js': ['public/app/app.js', 'public/app/services/*.js', 'public/app/components/**/*.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
}