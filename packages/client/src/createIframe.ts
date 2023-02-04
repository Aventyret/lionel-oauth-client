const createIframe = (id: string, url: string): Promise<HTMLIFrameElement> => {
  return new Promise(resolve => {
    const iframe: HTMLIFrameElement = window.document.createElement('iframe')
    iframe.src = url
    iframe.id = id
    iframe.setAttribute(
      'style',
      'width: 0; height: 0; position: absolute; border: 0;'
    )
    iframe.onload = () => resolve(iframe)
    window.document.body.appendChild(iframe)
  })
}

export default createIframe
