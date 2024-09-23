// @ts-ignore
import AntdMomentWebpackPlugin from "@ant-design/moment-webpack-plugin"
import assert from "assert"
import { dirname, join } from "path"
import { IApi, RUNTIME_TYPE_FILE_NAME } from "umi"
import { deepmerge, semver, winPath } from "umi/plugin-utils"
import { TEMPLATES_DIR } from "./constants"
import { resolveProjectDep } from "./utils/resolveProjectDep"
import { withTmpPath } from "./utils/withTmpPath"

const ANTD_TEMPLATES_DIR = join(TEMPLATES_DIR, "antd")

export default (api: IApi) => {
  let pkgPath: string
  let antdVersion = "5.0.0"
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: "antd",
      }) || dirname(require.resolve("antd/package.json"))
    antdVersion = require(`${pkgPath}/package.json`).version
  } catch (e) {}

  const isV5 = antdVersion.startsWith("5")
  // App components exist only from 5.1.0 onwards
  const appComponentAvailable = semver.gte(antdVersion, "5.1.0")
  const appConfigAvailable = semver.gte(antdVersion, "5.3.0")
  const day2MomentAvailable = semver.gte(antdVersion, "5.0.0")

  api.describe({
    config: {
      schema({ zod }) {
        const commonSchema: Parameters<typeof zod.object>[0] = {
          dark: zod.boolean(),
          compact: zod.boolean(),
          // babel-plugin-import
          import: zod.boolean(),
          // less or css, default less
          style: zod.enum(["less", "css"]).describe("less or css, default less"),
        }
        const createZodRecordWithSpecifiedPartial = (partial: Parameters<typeof zod.object>[0]) => {
          const keys = Object.keys(partial)
          return zod.union([
            zod.object(partial),
            zod.record(zod.any()).refine((obj) => {
              return !keys.some((key) => key in obj)
            }),
          ])
        }
        const createV5Schema = () => {
          // Reason: https://github.com/umijs/umi/pull/11924
          // Refer:  https://github.com/ant-design/ant-design/blob/master/components/theme/interface/components.ts
          const componentNameSchema = zod.string().refine(
            (value) => {
              const firstLetter = value.slice(0, 1)
              return firstLetter === firstLetter.toUpperCase() // first letter is uppercase
            },
            {
              message: "theme.components.[componentName] needs to be in PascalCase, e.g. theme.components.Button",
            }
          )
          const themeSchema = createZodRecordWithSpecifiedPartial({
            components: zod.record(componentNameSchema, zod.record(zod.any())),
          })
          const configProvider = createZodRecordWithSpecifiedPartial({
            theme: themeSchema,
          })

          return zod
            .object({
              ...commonSchema,
              theme: themeSchema.describe("Shortcut of `configProvider.theme`"),
              appConfig: zod.record(zod.any()).describe("Only >= antd@5.1.0 is supported"),
              momentPicker: zod.boolean().describe("DatePicker & Calendar use moment version"),
              styleProvider: zod.record(zod.any()),
              configProvider,
            })
            .deepPartial()
        }
        if (isV5) {
          return createV5Schema()
        }
        return zod.object({})
      },
    },
    enableBy({ userConfig }) {
      return process.env.UMI_PLUGIN_ANTD_ENABLE || userConfig.antd
    },
  })

  api.addRuntimePluginKey(() => ["antd"])

  function checkPkgPath() {
    if (!pkgPath) {
      throw new Error(`Can't find antd package. Please install antd first.`)
    }
  }

  api.modifyAppData((memo) => {
    checkPkgPath()
    const version = require(`${pkgPath}/package.json`).version
    memo.antd = {
      pkgPath,
      version,
    }
    return memo
  })

  api.modifyConfig((memo) => {
    checkPkgPath()

    let antd = memo.antd || {}
    if (process.env.UMI_PLUGIN_ANTD_ENABLE) {
      const { defaultConfig } = JSON.parse(process.env.UMI_PLUGIN_ANTD_ENABLE)
      memo.antd = antd = Object.assign(defaultConfig, antd)
    }

    // antd import
    memo.alias.antd = pkgPath

    if (isV5) {
      const theme = require("@ant-design/antd-theme-variable")
      memo.theme = {
        ...theme,
        ...memo.theme,
      }
      if (memo.antd?.import) {
        const errorMessage = `Can't set antd.import while using antd5 (${antdVersion})`

        api.logger.fatal("please change config antd.import to false, then start server again")

        throw Error(errorMessage)
      }
    }

    // allow use `antd.theme` as the shortcut of `antd.configProvider.theme`
    if (antd.theme) {
      assert(isV5, `antd.theme is only valid when antd is 5`)
      antd.configProvider ??= {}
      // priority: antd.theme > antd.configProvider.theme
      antd.configProvider.theme = deepmerge(antd.configProvider.theme || {}, antd.theme)

      // https://github.com/umijs/umi/issues/11156
      assert(
        !antd.configProvider.theme.algorithm,
        `The 'algorithm' option only available for runtime config, please move it to the runtime plugin, see: https://umijs.org/docs/max/antd`
      )
    }

    if (antd.appConfig) {
      if (!appComponentAvailable) {
        delete antd.appConfig
        api.logger.warn(`antd.appConfig is only available in version 5.1.0 and above, but you are using version ${antdVersion}`)
      } else if (!appConfigAvailable && Object.keys(antd.appConfig).length > 0) {
        api.logger.warn(`versions [5.1.0 ~ 5.3.0) only allows antd.appConfig to be set to \`{}\``)
      }
    }

    if (antd.dark || antd.compact) {
      antd.configProvider ??= {}
    }

    return memo
  })

  // Webpack
  api.chainWebpack((memo) => {
    if (api.config.antd.momentPicker) {
      if (day2MomentAvailable) {
        memo.plugin("antd-moment-webpack-plugin").use(AntdMomentWebpackPlugin)
      } else {
        api.logger.warn(`MomentPicker is only available in version 5.0.0 and above, but you are using version ${antdVersion}`)
      }
    }
    return memo
  })

  const lodashPkg = dirname(require.resolve("lodash/package.json"))
  const lodashPath = {
    merge: winPath(join(lodashPkg, "merge")),
  }

  // antd config provider & app component
  api.onGenerateFiles(() => {
    const withConfigProvider = !!api.config.antd.configProvider
    const withAppConfig = appConfigAvailable && !!api.config.antd.appConfig
    const styleProvider = api.config.antd.styleProvider
    const userInputCompact = api.config.antd.compact
    const userInputDark = api.config.antd.dark

    const ieTarget = !!api.config.targets?.ie || !!api.config.legacy

    let styleProviderConfig: any = false

    if (isV5 && (ieTarget || styleProvider)) {
      const cssinjs =
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: "@ant-design/cssinjs",
        }) || dirname(require.resolve("@ant-design/cssinjs/package.json"))

      if (cssinjs) {
        styleProviderConfig = {
          cssinjs: winPath(cssinjs),
        }

        if (ieTarget) {
          styleProviderConfig.hashPriority = "high"
          styleProviderConfig.legacyTransformer = true
        }

        styleProviderConfig = {
          ...styleProviderConfig,
          ...styleProvider,
        }
      }
    }

    // Template
    const configProvider = withConfigProvider && JSON.stringify(api.config.antd.configProvider)
    const appConfig = appComponentAvailable && JSON.stringify(api.config.antd.appConfig)
    const enableV5ThemeAlgorithm = isV5 && (userInputCompact || userInputDark) ? { compact: userInputCompact, dark: userInputDark } : false
    const hasConfigProvider = configProvider || enableV5ThemeAlgorithm
    const antdConfigSetter = isV5 && hasConfigProvider

    // We ensure the `theme` config always exists to preserve the theme context.
    //   1. if we do not config the antd `theme`, no theme react context is added.
    //   2. when using the antd setter to change the theme, the theme react context will be added,
    //      then antd components re-render.
    //   3. affected by the theme react context change, the model data context renders,
    //      gets the initial data again (a hack), and calls `setState`
    // there is a conflict between 2 and 3, react does not allow `setState` calls during rendering.
    // See https://github.com/umijs/umi/issues/12394
    //     https://github.com/ant-design/ant-design/blob/253b45eceb2c7760e8173ee0cd1003aecc00ef9c/components/config-provider/index.tsx#L615
    const isModelPluginEnabled = api.isPluginEnable("model")
    const modelPluginCompat = isModelPluginEnabled && antdConfigSetter

    api.writeTmpFile({
      path: `runtime.tsx`,
      context: {
        configProvider,
        appConfig,
        styleProvider: styleProviderConfig,
        enableV5ThemeAlgorithm,
        antdConfigSetter,
        modelPluginCompat,
        lodashPath,
        disableInternalStatic: semver.gt(antdVersion, "4.13.0"),
      },
      tplPath: winPath(join(ANTD_TEMPLATES_DIR, "runtime.ts.tpl")),
    })

    api.writeTmpFile({
      path: "types.d.ts",
      context: {
        withConfigProvider,
        withAppConfig,
      },
      tplPath: winPath(join(ANTD_TEMPLATES_DIR, "types.d.ts.tpl")),
    })

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { RuntimeAntdConfig } from './types.d';
export type IRuntimeConfig = {
  antd?: RuntimeAntdConfig
};
      `,
    })

    if (antdConfigSetter) {
      api.writeTmpFile({
        path: "index.tsx",
        content: `import React from 'react';
import { AntdConfigContext, AntdConfigContextSetter } from './context';

export function useAntdConfig() {
  return React.useContext(AntdConfigContext);
}

export function useAntdConfigSetter() {
  return React.useContext(AntdConfigContextSetter);
}`,
      })
      api.writeTmpFile({
        path: "context.tsx",
        content: `import React from 'react';
import type { ConfigProviderProps } from 'antd/es/config-provider';

export const AntdConfigContext = React.createContext<ConfigProviderProps>(null!);
export const AntdConfigContextSetter = React.createContext<React.Dispatch<React.SetStateAction<ConfigProviderProps>>>(
  () => {
    console.error(\`The 'useAntdConfigSetter()' method depends on the antd 'ConfigProvider', requires one of 'antd.configProvider' / 'antd.dark' / 'antd.compact' to be enabled.\`);
  }
);
`,
      })
    }
  })

  api.addRuntimePlugin(() => {
    if (api.config.antd.styleProvider || api.config.antd.configProvider || (appComponentAvailable && api.config.antd.appConfig)) {
      return [withTmpPath({ api, path: "runtime.tsx" })]
    }
    return []
  })

  api.addEntryImportsAhead(() => {
    const imports: Awaited<ReturnType<Parameters<IApi["addEntryImportsAhead"]>[0]["fn"]>> = []
    // import antd@5 reset style
    imports.push({ source: "antd/dist/reset.css" })

    return imports
  })
}
