// Change this to `import lionel from 'lionel'` in the wild
import lionel from '../../../src/'

console.log({ lionel })

import './style.css'
import logoUrl from './assets/images/lionel-logo.svg'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <img src="${logoUrl}" alt="logo" />
  <h1>Lionel Oauth Client Example</h1>
`
