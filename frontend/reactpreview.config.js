// https://reactpreview.com/docs/config/overview
module.exports = {
    // Aliasing of paths to directories.
    //
    // Note: tsconfig.json path aliases are automatically detected, they can be omitted.
    alias: {
    // app: "src",
    },

    // Public assets directory.
    publicDir: "public",

    // SVGR configuration.
    svgr: {
        componentName: "ReactComponent", // use "default" for default exports
    },

    // Wrapper file configuration.
    wrapper: {
        path: "__reactpreview__/Wrapper.tsx",
        componentName: "Wrapper",
    },
};
