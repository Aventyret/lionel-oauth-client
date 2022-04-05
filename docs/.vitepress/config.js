import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/lionel-oauth-client/',
  title: 'Lionel oAuth Client',
  description:
    'An oAuth client with OpenID Connect support for browser based applications.',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/lionel-logo.svg' }]
  ],
  themeConfig: {
    repo: 'Aventyret/lionel-oauth-client',
    logo: '/lionel-logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Config', link: '/config/' },
      {
        text: 'Releases',
        link: 'https://github.com/Aventyret/lionel-oauth-client/releases'
      }
    ],

    sidebar: {
      '/config/': 'auto',
      '/': [
        {
          text: 'Guide',
          children: [
            {
              text: 'Getting Started',
              link: '/guide/'
            },
            {
              text: 'Features',
              link: '/guide/features'
            },
            {
              text: 'Contributing',
              link: '/guide/contributing'
            }
          ]
        }
      ]
    }
  }
})
