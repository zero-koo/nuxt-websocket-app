import withNuxt from './.nuxt/eslint.config.mjs'
import tailwind from 'eslint-plugin-tailwindcss'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt(
  ...tailwind.configs['flat/recommended'],
  {
    plugins: prettier,
  },
  prettierPluginRecommended,
  eslintConfigPrettier
)
