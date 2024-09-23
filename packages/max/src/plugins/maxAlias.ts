import { IApi } from "umi"

export default (api: IApi) => {
  api.modifyConfig((memo) => {
    memo.alias = {
      ...memo.alias,
      "@sortinox/umi-max": "@@/exports",
    }
    return memo
  })
}
