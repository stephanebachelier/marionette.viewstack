module.exports = {
  bundle: {
    src: ['lib/build.js'],
    dest: 'dist/<%= pkg.name.replace(/.js$/, "") %>.js'
  }
};
