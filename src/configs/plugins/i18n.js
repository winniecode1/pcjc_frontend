import VueI18n from 'vue-i18n'
import Vue from 'vue'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    'zh': require('@/configs/locales/zh-CN.json'),
    'en': require('@/configs/locales/en-US.json')
  }
})

export default i18n
