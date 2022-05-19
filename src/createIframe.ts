const createIframe = (url: string, id: string): Promise<HTMLIFrameElement> => {
  return new Promise(resolve => {
    const iframe: HTMLIFrameElement = window.document.createElement('iframe')
    iframe.src = url
    iframe.id = id
    iframe.onload = () => resolve(iframe)
  })
}

export default createIframe
