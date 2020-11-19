import Vue from 'vue';
import VueRouter from 'vue-router';

import Http401 from '@/components/error/401';
import Http403 from '@/components/error/403';
import Http404 from '@/components/error/404';
import Http500 from '@/components/error/500';

import Root from '@/components/common/Root.vue';
import TitanDesktop from '@/components/titan/core/TitanDesktop.vue';
import TitanFps from '@/components/titan/core/TitanFps.vue';

Vue.use(VueRouter);

var authenticationGuard = function(to, from, next)
{
    // no authentication at this time
    next();
};

var router = new VueRouter({
    saveScrollPosition: true,
    history: true,
    routes: [
        // entry point
        {
            path: '/',
            beforeEnter: authenticationGuard,
            redirect: {name: 'titan'}
        },
        // desktop
        {
            // must be authenticated to access this page or any child pages
            beforeEnter: authenticationGuard,
            path: '/titan',
            name: 'titan',
            redirect: {name: 'desktop'},
            component: Root,
            // here we try very hard to keep the paths and route names sensibly organised
            children: [
                { path: 'desktop', name: 'desktop', component: TitanDesktop },
                { path: 'fps', name: 'fps', component: TitanFps },
            ]
        },
        // error pages - 500, 403 and 404 for everything else
        { path: '/401', name: '401', component: Http401 },
        { path: '/403', name: '403', component: Http403 },
        { path: '/500', name: '500', component: Http500 },
        { path: '*',    name: '404', component: Http404 }
    ]
});

export default router;