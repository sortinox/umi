import { IApi } from "umi"

export default (api: IApi) => {
  api.modifyAppData((memo) => {
    memo.umi.name = "Sortinox Umi Max"
    memo.umi.importSource = "@sortinox/umi-max"
    memo.umi.cliName = "max"
    return memo
  })
}
