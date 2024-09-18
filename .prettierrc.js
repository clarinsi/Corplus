module.exports = {
    printWidth: 120,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    pluginSearchDirs: false,
    overrides: [],
    htmlWhitespaceSensitivity: "strict",
    importOrder: ["react", "next", "<THIRD_PARTY_MODULES>", "^(app|components|data|public|types|util)/?(.*)$", "^[./]"],
    importOrderSortSpecifiers: true,
    importOrderCaseInsensitive: false,
};
