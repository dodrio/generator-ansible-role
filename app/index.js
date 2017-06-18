'use strict'

const Generator = require('yeoman-generator')
const normalizeUrl = require('normalize-url')

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)

    this.option('org', {
      type: 'string',
      desc: 'Publish to a GitHub organization account'
    })
  }

  prompting () {
    const prompts = [
      {
        name: 'roleName',
        message: 'What do you want to name your ansible role?',
        default: this.appname
      },
      {
        name: 'roleDescription',
        message: 'What is your role description?',
        default: 'An ordinary role.'
      },
      {
        name: 'githubUsername',
        message: 'What is your GitHub username?',
        store: true,
        validate: x => x.length > 0 ? true : 'You have to provide a username',
        when: () => !this.options.org
      },
      {
        name: 'website',
        message: 'What is the URL of your website?',
        store: true,
        validate: x => x.length > 0 ? true : 'You have to provide a website URL',
        filter: x => normalizeUrl(x)
      }
    ]

    return this.prompt(prompts).then(props => {
      this.props = {
        roleName: props.roleName,
        roleDescription: props.roleDescription,
        githubUsername: this.options.org || props.githubUsername,
        repoName: `ansible-role-${props.roleName}`,
        name: this.user.git.name(),
        email: this.user.git.email(),
        website: props.website
      }
    })
  }

  default () {
    const { name, email, website } = this.props
    this.composeWith(require.resolve('generator-license'), {
      name,
      email,
      website,
      defaultLicense: 'MIT'
    })
  }

  writing () {
    this.fs.copyTpl([
      `${this.templatePath()}/**`
    ], this.destinationPath(), this.props)

    const mv = (from, to) => {
      this.fs.move(this.destinationPath(from), this.destinationPath(to))
    }

    mv('travis.yml', '.travis.yml')
  }

  git () {
    this.spawnCommandSync('git', ['init'])
  }
}
