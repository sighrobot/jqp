const { homepage } = require('./package.json');

module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: homepage,
        permanent: false,
      },
    ];
  },
};
