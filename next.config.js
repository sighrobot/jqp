/**
 * https://github.com/fiatjaf/jq-web/issues/5#issuecomment-854231848
 * https://github.com/vercel/next.js/issues/7755#issuecomment-812805708
 */

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
