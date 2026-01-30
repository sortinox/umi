{
  "private": true,
  "author": "{{{ author }}}",
  "scripts": {
    "dev": "max dev",
    "build": "max build",
    "build:analyze": "ANALYZE=1 max build",
    "format": "prettier --cache --write .",{{#withHusky}}
    "prepare": "husky",{{/withHusky}}
    "postinstall": "max setup",
    "setup": "max setup"
  },
  "dependencies": {
    "@ant-design/icons": "^6.1",
    "@ant-design/pro-components": "^3",
    "@sortinox/umi-max": "{{{ version }}}",
    "antd": "^6",
    "react": "^19.1",
    "react-dom": "^19.1",
    "rc-field-form": ">=1.22.0",
    "react-hotkeys-hook": "^4",
    "react-swipeable": "^7",
    "use-media-antd-query": "^1.1"
  },
  "devDependencies": {
    "@babel/core": "^7",
    "@types/react": "^19.1",
    "@types/react-dom": "^19.1",{{#withHusky}}
    "husky": "^9",{{/withHusky}}
    "prettier": "^3.3",
    "prettier-plugin-organize-imports": "^4",
    "prettier-plugin-packagejson": "^3",
    "prettier-plugin-tailwindcss": "^0.6.6",
    "tailwindcss": "^3",
    "typescript": "^5.9",
    "webpack": "^5",
    "styled-components": ">=2"
  }
}
