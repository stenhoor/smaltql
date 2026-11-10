import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './smaltdb.css'
import { withSmaltworks } from './stage'
import { enablePlaygrounds } from './playground'
import { enableRailroad } from './railroad'
import { sql } from './smaltql'

export default {
  extends: DefaultTheme,
  Layout: withSmaltworks(DefaultTheme),
  enhanceApp() {
    if (typeof document === 'undefined') return
    enablePlaygrounds({ runners: { sql } })
    enableRailroad()
  },
} satisfies Theme
