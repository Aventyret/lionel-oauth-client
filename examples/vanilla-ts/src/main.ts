import lionel from '../../../dist/index.ejs.js'

console.log({ lionel })

import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Lionel Oauth Client Example</h1>
`
