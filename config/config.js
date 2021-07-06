module.exports = {
  logging: { level: 'info' },
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'Security Blogs',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'BLOG',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    "Searches popular security blog and news sites and links to relevant results",
    entityTypes: ['hash','ip','domain','cve','email'],
    customTypes:[
    {
      key: 'allText',
      regex: /^[\s\S]{2,2048}$/
    }
  ],
  defaultColor: 'light-gray',
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  styles: ['./styles/style.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',

    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  onDemandOnly: true,
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'Valid Google CSE API Key',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'fuzzymatch',
      name: "Fuzzy Match",
      description:
        "When checked, finds results that are not an exact match." ,
      default: false,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'sources',
      name: 'Sources to IGNORE',
      description: 'Choose sources to attempt to filter from your results',
      default: [
        
      ],
      type: 'select',
      options: [
        {
          value: 'blogs.akamai.com',
          display: 'akamai.com'
        },
        {
          value: 'bleepingcomputer.com',
          display: 'bleepingcomputer.com'
        },
        {
          value: 'crowdstrike.com/blog/',
          display: 'crowdstrike.com'
        },
        {
          value: 'csoonline.com',
          display: 'csoonline.com'
        },
        {
          value: 'danielmiessler.com',
          display: 'danielmiessler.com'
        },
        {
          value: 'darkreading.com',
          display: 'darkreading.com'
        },
        {
          value: 'fireeye.com/*',
          display: 'fireeye.com'
        },
        {
          value: 'gbhackers.com',
          display: 'gbhackers.com'
        },
        {
          value: 'grahamcluley.com',
          display: 'grahamcluley.com'
        },
        {
          value: 'infosecurity-magazine.com',
          display: 'infosecurity-magazine.com'
        },
        {
          value: 'itsecurityguru.org',
          display: 'itsecurityguru.org'
        },
        {
          value: 'krebsonsecurity.com/*',
          display: 'krebsonsecurity.com'
        },
        {
          value: 'lastwatchdog.com',
          display: 'lastwatchdog.com'
        },
        {
          value: 'microsoft.com/security/blog/',
          display: 'microsoft.com'
        },
        {
          value: 'norfolkinfosec.com',
          display: 'norfolkinfosec.com'
        },
        {
          value: 'recordedfuture.com',
          display: 'recordedfuture.com'
        },
        {
          value: 'schneier.com',
          display: 'schneier.com'
        },
        {
          value: 'scmagazine.com',
          display: 'scmagazine.com'
        },
        {
          value: 'securityaffairs.co/wordpress/',
          display: 'securityaffairs.co'
        },
        {
          value: 'securityweek.com',
          display: 'securityweek.com'
        },
        {
          value: 'securityweekly.com',
          display: 'securityweekly.com'
        },
        {
          value: 'silobreaker.com',
          display: 'silobreaker.com'
        },
        {
          value: '*.sophos.com',
          display: 'sophos.com'
        },
        {
          value: 'blog.talosintelligence.com',
          display: 'talosintelligence.com'
        },
        {
          value: 'taosecurity.blogspot.com',
          display: 'taosecurity.blogspot.com'
        },
        {
          value: 'thehackernews.com',
          display: 'thehackernews.com'
        },
        {
          value: 'theregister.com',
          display: 'theregister.com'
        },
        {
          value: 'threatpost.com',
          display: 'threatpost.com'
        },
        {
          value: '*.trendmicro.com',
          display: 'trendmicro.com'
        },
        {
          value: 'tripwire.com/state-of-security/',
          display: 'tripwire.com'
        },
        {
          value: 'troyhunt.com',
          display: 'troyhunt.com'
        },
        {
          value: 'unit42.paloaltonetworks.com',
          display: 'unit42.paloaltonetworks.com'
        },
        {
          value: 'zdnet.com',
          display: 'zdnet.com'
        }
      ],
      multiple: true,
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
