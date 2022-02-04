import cmd from '../../lib/command.js'

export default cmd({
  name: 'config',
  category: 'setup',
  help: 'Get/set the value for the config key.',
  args: [
    {name: 'key', type: 'string'},
    {name: 'value', type: 'string', optional: true}
  ],
  opts: [],
  async command (args) {
    throw new Error('TODO')
  }
})