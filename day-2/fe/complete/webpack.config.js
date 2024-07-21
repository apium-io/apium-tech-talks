resolve: {
    fallback: {
        crypto: require.resolve("crypto-browserify");
        stream: require.resolve("stream-browserify");
        buffer: require.resolve("buffer");
        string_decoder: require.resolve("string_decoder/");
        https: require.resolve("https-browserify");
        zlib: require.resolve("browserify-zlib");
    }
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        }),
    ];
}