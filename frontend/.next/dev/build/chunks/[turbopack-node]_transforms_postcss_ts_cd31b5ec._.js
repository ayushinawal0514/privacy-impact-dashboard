module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Project/capstone_project/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/db6ab_b79a7a5c._.js",
  "chunks/[root-of-the-server]__b58e9fc3._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Project/capstone_project/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];