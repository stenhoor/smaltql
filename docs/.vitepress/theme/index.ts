import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './smaltdb.css'
import { withSmaltworks } from './stage'
import { enablePlaygrounds } from './playground'
import { sql } from './smaltql'

export default {
  extends: DefaultTheme,
  Layout: withSmaltworks(DefaultTheme),
  enhanceApp() {
    if (typeof document !== 'undefined') enablePlaygrounds({ runners: { sql } })
  },
} satisfies Theme
