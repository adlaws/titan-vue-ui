// vue.config.js
module.exports = {
    // this makes the imports of the css, js etc in the generated
    // HTML use relative rather than absolute paths - without it
    // the CSS/JSS is imported like...
    //
    //    <script src=/js/chunk-vendors.6cd7c224.js>
    //                ^
    //
    // ...which won't work inside Outerra as it's file based, so we need...
    //
    //    <script src=js/chunk-vendors.6cd7c224.js>
    //                ^
    // ...so it can find the files.
    publicPath: '',
    // do/don't produce JavaScript source map files for production, which
    // would tend to massively increase the size of the deployed resources.
    // Since we are deploying into Outerra, the map files are effectively of
    // no use in any case.
    productionSourceMap: true,
    devServer: {
        // See:
        //     https://forum.vuejs.org/t/vue-cli-serve-with-https/39359
        //     https://webpack.js.org/configuration/dev-server/#devserverhttps
        // if true, `npm run serve` will start on HTTPS using a self signed
        // certificate.
        //     https: true,
        // Alternatively, set the key/certificate with...
        //     key: fs.readFileSync('/path/to/server.key'),
        //     cert: fs.readFileSync('/path/to/server.crt'),
        //     ca: fs.readFileSync('/path/to/ca.pem'),
    },
    // avoid adding the build hash to the built filenames
    filenameHashing: false,

    // eslint-disable-next-line no-unused-vars
    chainWebpack: config =>
    {
        // Prevent multiple SVG files of the same name (but in different paths) exporting
        // on top of each other by including the path as well as the filename in the built
        // files. Necessary for `flag-icon-css` package to prevent warnings.
        //     ref: https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
        config.module
            .rule('svg')
            .test(/\.svg$/)
            .use('file-loader')
            // eslint-disable-next-line no-unused-vars
            .tap(options =>
            {
                return { name: "[path][name].[ext]" };
            });

        // WebPack shim to bring in TitanEventHandlers / TitanEvent globals
        // Ref: https://webpack.js.org/guides/shimming/
        //      https://jamesscheller.com/tag/nuxt-js/
        /*
        config.module
            .rule('exports-loader')
            .test(require.resolve('../../js/titanEventListener.js'))
            .use('exports-loader')
            // exports from titanEventListener.js...
            //      $global.titanEventHandlers as TitanEventHandlers
            //      $global.TitanEvent TitanEvent
            // can be used in components by doing...
            //      const { TitanEventHandlers, TitanEvent } = require('@/../../../js/titanEventListener.js');
            .loader('exports-loader?type=commonjs&exports[]=multiple|$global.titanEventHandlers|TitanEventHandlers&exports[]=multiple|$global.TitanEvent|TitanEvent')
            .end();
        */
    }
};
