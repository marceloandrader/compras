var critical = require('critical');

critical.generate({
  base: 'dist',
  src: '/index.html',
  dest: 'dist/main.css'
});
