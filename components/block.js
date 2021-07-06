polarity.export = PolarityComponent.extend({
  // Hides the filter menu by default
  viewFilters: false,
  // This is the initial view limit. The user can view up to 10 by clicking on a "view more" action link
  viewLimit: 5,
  // Stores any error messages from our onMessage hook
  errorMessage: '',
  infoMessage: '',
  details: Ember.computed.alias('block.data.details'),
  searchResults: Ember.computed.alias('details.searchResults'),
  searchInformation: Ember.computed.alias('searchResults.searchInformation'),
  icons: Ember.computed.alias('details.icons'),
  searchFilters: Ember.computed.alias('block.storage.searchFilters'),
  numSourcesToSearch: Ember.computed.alias('block.storage.numSourcesToSearch'),
  init: function () {
    this._super(...arguments);
    if (!this.get('block.storage.searchFilters')) {
      this.set('block.storage', {});
      this.set('block.storage.searchFilters', [
        {
          displayValue: 'akamai.com',
          filterValue: 'blogs.akamai.com',
          id: 'aka-checkbox',
          value: true
        },
        {
          displayValue: 'bleepingcomputer.com',
          filterValue: 'bleepingcomputer.com',
          id: 'ble-checkbox',
          value: true
        },
        {
          displayValue: 'crowdstrike.com',
          filterValue: 'crowdstrike.com/blog/',
          id: 'cro-checkbox',
          value: true
        },
        {
          displayValue: 'csoonline.com',
          filterValue: 'csoonline.com',
          id: 'cso-checkbox',
          value: true
        },
        {
          displayValue: 'danielmiessler.com',
          filterValue: 'danielmiessler.com',
          id: 'dan-checkbox',
          value: true
        },
        {
          displayValue: 'darkreading.com',
          filterValue: 'darkreading.com',
          id: 'dar-checkbox',
          value: true
        },
        {
          displayValue: 'fireeye.com',
          filterValue: 'fireeye.com',
          id: 'fir-checkbox',
          value: true
        },
        {
          displayValue: 'gbhackers.com',
          filterValue: 'gbhackers.com',
          id: 'gph-checkbox',
          value: true
        },
        {
          displayValue: 'grahamcluley.com',
          filterValue: 'grahamcluley.com',
          id: 'gra-checkbox',
          value: true
        },
        {
          displayValue: 'infosecurity-magazine.com',
          filterValue: 'infosecurity-magazine.com',
          id: 'inf-checkbox',
          value: true
        },
        {
          displayValue: 'itsecurityguru.org',
          filterValue: 'itsecurityguru.org',
          id: 'its-checkbox',
          value: true
        },
        {
          displayValue: 'krebsonsecurity.com',
          filterValue: 'krebsonsecurity.com',
          id: 'kre-checkbox',
          value: true
        },
        {
          displayValue: 'lastwatchdog.com',
          filterValue: 'lastwatchdog.com',
          id: 'las-checkbox',
          value: true
        },
        {
          displayValue: 'microsoft.com',
          filterValue: 'microsoft.com/security/blog/',
          id: 'mic-checkbox',
          value: true
        },
        {
          displayValue: 'norfolkinfosec.com',
          filterValue: 'norfolkinfosec.com',
          id: 'nor-checkbox',
          value: true
        },
        {
          displayValue: 'recordedfuture.com',
          filterValue: 'recordedfuture.com',
          id: 'rec-checkbox',
          value: true
        },
        {
          displayValue: 'schneier.com',
          filterValue: 'schneier.com',
          id: 'sch-checkbox',
          value: true
        },
        {
          displayValue: 'scmagazine.com',
          filterValue: 'scmagazine.com',
          id: 'scm-checkbox',
          value: true
        },
        {
          displayValue: 'securityaffairs.co',
          filterValue: 'securityaffairs.co',
          id: 'seca-checkbox',
          value: true
        },
        {
          displayValue: 'securityweek.com',
          filterValue: 'securityweek.com',
          id: 'secw-checkbox',
          value: true
        },
        {
          displayValue: 'securityweekly.com',
          filterValue: 'securityweekly.com',
          id: 'secwy-checkbox',
          value: true
        },
        {
          displayValue: 'silobreaker.com',
          filterValue: 'silobreaker.com',
          id: 'sil-checkbox',
          value: true
        },
        {
          displayValue: 'sophos.com',
          filterValue: '*.sophos.com',
          id: 'sop-checkbox',
          value: true
        },
        {
          displayValue: 'blog.talosintelligence.com',
          filterValue: 'talosintelligence.com',
          id: 'tal-checkbox',
          value: true
        },
        {
          displayValue: 'taosecurity.blogspot.com',
          filterValue: 'taosecurity.blogspot.com',
          id: 'tao-checkbox',
          value: true
        },
        {
          displayValue: 'thehackernews.com',
          filterValue: 'thehackernews.com',
          id: 'thn-checkbox',
          value: true
        },
        {
          displayValue: 'theregister.com',
          filterValue: 'theregister.com',
          id: 'tre-checkbox',
          value: true
        },
        {
          displayValue: 'threatpost.com',
          filterValue: 'threatpost.com',
          id: 'tpo-checkbox',
          value: true
        },
        {
          displayValue: 'trendmicro.com',
          filterValue: '*.trendmicro.com',
          id: 'tmi-checkbox',
          value: true
        },
        {
          displayValue: 'tripwire.com',
          filterValue: 'tripwire.com',
          id: 'tpw-checkbox',
          value: true
        },
        {
          displayValue: 'troyhunt.com',
          filterValue: 'troyhunt.com',
          id: 'thu-checkbox',
          value: true
        },
        {
          displayValue: 'unit42.paloaltonetworks.com',
          filterValue: 'unit42.paloaltonetworks.com',
          id: 'uni-checkbox',
          value: true
        },
        {
          displayValue: 'zdnet.com',
          filterValue: 'zdnet.com',
          id: 'zdn-checkbox',
          value: true
        }
      ]);
      this.set('block.storage.numSourcesToSearch', this.get('block.storage.searchFilters.length'));
    }
  },
  actions: {
    toggleFilter: function () {
      this.toggleProperty('viewFilters');
    },
    applyFilter: function () {
      this.set('errorMessage', '');
      this.set('infoMessage', '');

      const numSourcesToSearch = this.getNumSourcesSearched();
      if (numSourcesToSearch === 0) {
        this.set('infoMessage', 'Select at least one source to search');
        return;
      }
      this.set('filtering', true);
      const payload = {
        entity: this.block.entity,
        searchFilters: this.searchFilters
      };

      this.sendIntegrationMessage(payload)
        .then((searchResults) => {
          this.set('block.data.details.searchResults', searchResults);
        })
        .catch((err) => {
          console.error(err);
          if (typeof err.meta === 'string') {
            this.set('errorMessage', err.meta);
          } else if (typeof err.meta === 'object' && typeof err.meta.error === 'string') {
            this.set('errorMessage', err.meta.error);
          } else if (typeof err.meta === 'object' && typeof err.meta.detail === 'string') {
            this.set('errorMessage', err.meta.detail);
          } else {
            this.set('errorMessage', JSON.stringify(err.meta));
          }
        })
        .finally(() => {
          this.set('numSourcesToSearch', numSourcesToSearch);
          this.set('filtering', false);
        });
    },
    selectAll: function () {
      for (let i = 0; i < this.searchFilters.length; i++) {
        this.set(`searchFilters.${i}.value`, true);
      }
    },
    clearAll: function () {
      for (let i = 0; i < this.searchFilters.length; i++) {
        this.set(`searchFilters.${i}.value`, false);
      }
    },
    viewMore: function () {
      this.set('viewLimit', 10);
    }
  },
  getNumSourcesSearched() {
    let numSourcesToSearch = 0;
    for (let i = 0; i < this.searchFilters.length; i++) {
      if (this.searchFilters[i].value === true) {
        ++numSourcesToSearch;
      }
    }
    return numSourcesToSearch;
  }
});
