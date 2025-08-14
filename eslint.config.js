import jsConfig from '@appliedminds/eslint-config'
import globals from 'globals'

jsConfig["rules"]["linebreak-style"] = "off"

export default [
    ...jsConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    }
]
