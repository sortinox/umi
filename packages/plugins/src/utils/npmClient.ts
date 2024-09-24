import type { IApi } from "umi"
import { NpmClientEnum } from "umi/plugin-utils"

const FLATTED_NPM_CLIENT: NpmClientEnum[] = [NpmClientEnum.npm, NpmClientEnum.yarn]

export const isFlattedNodeModulesDir = (api: IApi) => {
  let currentNpmClient = api.appData.npmClient
  const tnpmCompatMode: string | undefined = api.appData.npmClient === NpmClientEnum.tnpm && api.pkg.tnpm?.mode
  if (tnpmCompatMode) {
    if (FLATTED_NPM_CLIENT.includes(api.pkg.tnpm.mode)) {
      return true
    }
  }
  const isFlattedDir = FLATTED_NPM_CLIENT.includes(currentNpmClient)
  return isFlattedDir
}
