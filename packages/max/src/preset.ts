export default () => {
  return {
    plugins: [
      require.resolve("@sortinox/umi-plugins/dist/access"),
      require.resolve("@sortinox/umi-plugins/dist/analytics"),
      require.resolve("@sortinox/umi-plugins/dist/antd"),
      require.resolve("@sortinox/umi-plugins/dist/initial-state"),
      require.resolve("@sortinox/umi-plugins/dist/layout"),
      require.resolve("@sortinox/umi-plugins/dist/locale"),
      require.resolve("@sortinox/umi-plugins/dist/model"),
      require.resolve("@sortinox/umi-plugins/dist/moment2dayjs"),
      require.resolve("@sortinox/umi-plugins/dist/request"),
      require.resolve("@sortinox/umi-plugins/dist/tailwindcss"),
      require.resolve("./plugins/maxAlias"),
      require.resolve("./plugins/maxAppData"),
      require.resolve("./plugins/maxChecker"),
    ],
  }
}
