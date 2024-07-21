const webpack = require("webpack");
module.exports = function override(config) {
    config.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        string_decoder: require.resolve("string_decoder/"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http")
    };
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ]);
    return config;
};