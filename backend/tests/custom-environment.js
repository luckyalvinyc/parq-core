import NodeEnvironment from 'jest-environment-node'

import * as utils from './utils.js'

class CustomEnvironment extends NodeEnvironment {
  constructor (config, context) {
    super(config, context)

    this.testPath = context.testPath
  }

  async setup () {
    await super.setup()

    if (!this.testPath.includes('stores')) {
      return
    }

    this.db = await utils.db.create()
    this.global.db = this.db
  }

  async teardown () {
    if (this.db) {
      await this.db.drop()
    }

    await super.teardown()
  }
}

export default CustomEnvironment
