// vue.config.js
module.exports = {
    // this makes the imports of the css, js etc in the generated
    // HTML use relative rather than absolute paths - without it
    // the CSS/JSS is imported like...
    //
    //    <script src=/js/chunk-vendors.6cd7c224.js>
    //                ^
    //
    // ...which won't work inside Titan as it's file based, so we need...
    //
    //    <script src=js/chunk-vendors.6cd7c224.js>
    //                ^
    // ...so it can find the files.
    publicPath: '',
    // don't produce JavaScript source map files for production, which
    // would otherwise massively increase the size of the deployed
    // resources. Since we are deploying into Titan, the map files are
    // effectively of no use in any case.
    productionSourceMap: false,
};
