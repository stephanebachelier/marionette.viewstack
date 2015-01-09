module.exports = {
  options: {
    banner: '<%= banner %>'
  },
  dist: {
    src: '<%= umd.lib.dest %>',
    dest: 'dist/<%= pkg.name.replace(/\.js$/, "") %>.min.js'
  }
};
