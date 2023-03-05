const isSourceActive = (value, sources) => !!sources.find((source) => source.value === value);

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
    const sources = this.get('details.sources');
    const selectedSources = this.get('details.selectedSources');
    if (!this.get('block.storage.searchFilters')) {
      this.set('block.storage', {});
      this.set(
        'block.storage.searchFilters',
        sources
          .map((source) => ({
            displayValue: source.display,
            filterValue: source.value,
            id: 'checkbox',
            value: isSourceActive(source.value, selectedSources)
          }))
      );
      this.set('block.storage.numSourcesToSearch', this.get('block.storage.searchFilters.length'));
    }

    let array = new Uint32Array(5);
    this.set('uniqueIdPrefix', window.crypto.getRandomValues(array).join(''));

    this._super(...arguments);
  },
  actions: {
    copyData: function () {
      const savedViewLimit = this.get('viewLimit');
      this.setMaxViewLimit();

      Ember.run.scheduleOnce(
          'afterRender',
          this,
          this.copyElementToClipboard,
          `security-blogs-container-${this.get('uniqueIdPrefix')}`
      );

      Ember.run.scheduleOnce('destroy', this, this.restoreCopyState, savedViewLimit);
    },
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
      this.setMaxViewLimit();
    }
  },
  setMaxViewLimit(){
    this.set('viewLimit', this.get('maxViewLimit'));
  },
  getNumSourcesSearched() {
    let numSourcesToSearch = 0;
    for (let i = 0; i < this.searchFilters.length; i++) {
      if (this.searchFilters[i].value === true) {
        ++numSourcesToSearch;
      }
    }
    return numSourcesToSearch;
  },
  copyElementToClipboard(element) {
    let images = document.getElementById(element).getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      images[i].style.display = 'none';
    }

    window.getSelection().removeAllRanges();
    let range = document.createRange();

    range.selectNode(typeof element === 'string' ? document.getElementById(element) : element);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    for (let i = 0; i < images.length; i++) {
      images[i].style.display = 'block';
    }
  },
  restoreCopyState(savedViewLimit) {
    this.set('viewLimit', savedViewLimit);
    this.set('showCopyMessage', true);

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.set('showCopyMessage', false);
      }
    }, 2000);
  }
});
