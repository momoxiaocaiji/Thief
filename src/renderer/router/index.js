import { createRouter, createWebHashHistory } from 'vue-router'
import Pdf from '@/components/pdf.vue'
import Video from '@/components/video.vue'
import Web from '@/components/web.vue'
import So from '@/components/so.vue'
import Setting from '@/components/setting.vue'
import Desktop from '@/components/desktop.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/setting' },
    { path: '/pdf', name: 'pdf', component: Pdf },
    { path: '/video', name: 'video', component: Video },
    { path: '/web', name: 'web', component: Web },
    { path: '/so', name: 'so', component: So },
    { path: '/setting', name: 'setting', component: Setting },
    { path: '/desktop', name: 'desktop', component: Desktop }
  ]
})
