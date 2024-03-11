export type Launcher = {
  name: string
  path: string
  config: {
    menu: {
      reverse: boolean
      vertical: boolean
    }
    pages: {
      splash: {
        background: string
      }
      login: {
        background: string
      }
    }
  }
}
