'use strict';

const request = require('request');
const config = require('./config/config');
const icons = require('./src/icons');
const async = require('async');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let Logger;
let requestWithDefaults;

const MAX_PARALLEL_LOOKUPS = 10;
const SEARCH_ENGINE_ID = '2e5f92581998d0c05';
const SOURCES = [
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
];

function startup(logger) {
  let defaults = {};
  Logger = logger;

  const { cert, key, passphrase, ca, proxy, rejectUnauthorized } = config.request;

  if (typeof cert === 'string' && cert.length > 0) {
    defaults.cert = fs.readFileSync(cert);
  }

  if (typeof key === 'string' && key.length > 0) {
    defaults.key = fs.readFileSync(key);
  }

  if (typeof passphrase === 'string' && passphrase.length > 0) {
    defaults.passphrase = passphrase;
  }

  if (typeof ca === 'string' && ca.length > 0) {
    defaults.ca = fs.readFileSync(ca);
  }

  if (typeof proxy === 'string' && proxy.length > 0) {
    defaults.proxy = proxy;
  }

  if (typeof rejectUnauthorized === 'boolean') {
    defaults.rejectUnauthorized = rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(defaults);
}

function _createQuery(entity, searchFilters, options) {
  entity.value = entity.value.trim();
  let query ="";
  if (entity.isIPv4){
    //defang IP because that is how it is searchable on CISA website
    query = `${entity.value} OR "${entity.value.replace(new RegExp(/(\.)\d+$/),'[.]')}"`;
  }
  /*else if (entity.isEmail){
    //defang IP because that is how it is searchable on CISA website
    query = `"${entity.value.replace('@','[@]')}"`;
  }*/
  else
  {
    if (options.fuzzymatch){
      //replace = sign because google will treat this as its own entity
      query = `${entity.value.replace('=',' ').trim()}`;
    }
    else{
      //replace = sign because google will treat this as its own entity
      query = `"${entity.value.replace('=',' ').trim()}"`;
    }
  }
  //I went with ignore because GSE has a search string limit I was hitting
  //so I inverted to logic to have the default work more consistently
  searchFilters.forEach((filter) => {
    if (filter.value === undefined || filter.value) {
      query += ` site:${filter.filterValue || filter.value} OR`;
    }
  });
  //Remove trailing OR
  query = query.replace(/ OR$/, '');

  
  return query;
}

function _searchEntity(entity, searchFilters, options, cb) {
  const requestOptions = {
    method: 'GET',
    uri: 'https://www.googleapis.com/customsearch/v1/',
    qs: {
      key: options.apiKey,
      cx: SEARCH_ENGINE_ID,
      num: 10, // 10 is the max allowed by the API
      q: _createQuery(entity, searchFilters, options),
      quotaUser: uuidv4()
    },
    json: true
  };
  
  Logger.trace({ requestOptions }, 'Request Options');

  requestWithDefaults(requestOptions, function (error, res, body) {
    let processedResult = handleRestError(error, entity, res, body);
    Logger.trace({ body, status: res ? res.statusCode : 'Not Available' }, 'Result');

    if (processedResult.error) {
      cb(processedResult);
      return;
    }

    cb(null, processedResult);
  });
}

function _formatDetails(body, options) {
  // The return result contains a lot additional information we don't use, pluck out just the fields
  // we display in the template to reduce the amount of cached data and the size of the return payload
  const items = body.items.map((item) => {
    const icon = icons.displayNameToIcon[item.displayLink];
    return {
      icon: icon ? icon : '',
      displayLink: item.displayLink,
      title: item.title,
      link: item.link,
      snippet: item.snippet
    };
  });
  const ignoredSources = options.sources.map((type) => type.value);
  const selectedSources = SOURCES.filter((source) => !ignoredSources.includes(source.value));
  return {
    icons: icons.icons,
    searchResults: {
      searchInformation: body.searchInformation,
      items
    },
    sources: SOURCES,
    selectedSources
  };
}

function doLookup(entities, options, cb) {
  let lookupResults = [];
  let tasks = [];
  const ignoredSources = options.sources.map((type) => type.value);
  const SEARCH_FILTER = SOURCES.filter((source) => !ignoredSources.includes(source.value));
  //const NO_SEARCH_FILTER = [];

  Logger.debug({ entities, options }, 'doLookup');
  entities.forEach((entity) => {
    tasks.push(function (done) {
      _searchEntity(entity, SEARCH_FILTER, options, done);
    });
  });

  async.parallelLimit(tasks, MAX_PARALLEL_LOOKUPS, (err, results) => {
    if (err) {
      Logger.error({ err: err }, 'Error');
      cb(err);
      return;
    }

    results.forEach((result) => {
      if (_isMiss(result.body)) {
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else {
        lookupResults.push({
          entity: result.entity,
          displayValue: `${result.entity.value.slice(0, 120)}${
              result.entity.value.length > 120 ? '...' : ''
            }`,
          data: {
            summary: [`${result.body.searchInformation.totalResults} posts`],
            details: _formatDetails(result.body, options)
          }
        });
      }
    });

    Logger.debug({ lookupResults }, 'Results');
    cb(null, lookupResults);
  });
}

function _isMiss(body) {
  return body === null || body.searchInformation.totalResults === '0';
}

function handleRestError(error, entity, res, body) {
  let result;

  if (error || !body) {
    return {
      error,
      body,
      detail: 'HTTP Request Error'
    };
  }

  if (res.statusCode === 400) {
    return {
      error: body.error && body.error.message ? body.error.message : 'There was an error in the request',
      statusCode: res ? res.statusCode : 'Unknown',
      detail: body.error && body.error.message ? body.error.message : 'There was an error in the request'
    };
  }

  if (res.statusCode === 429) {
    return {
      error: body.error && body.error.message ? body.error.message : 'Search quota exceeded',
      statusCode: res ? res.statusCode : 'Unknown',
      detail: 'Search quota exceeded'
    };
  }

  if (res.statusCode === 403) {
    return {
      error: body.error && body.error.message ? body.error.message : 'The request is missing a valid API key.',
      statusCode: res ? res.statusCode : 'Unknown',
      detail: 'The request is missing a valid API key.'
    };
  }

  if (res.statusCode !== 200) {
    return {
      error: 'Did not receive HTTP 200 Status Code',
      statusCode: res ? res.statusCode : 'Unknown',
      detail: 'An unexpected error occurred',
      body,
      res
    };
  }

  if (res.statusCode === 200) {
    // we got data!
    result = {
      entity: entity,
      body: body
    };
  } else {
    result = {
      body,
      errorNumber: body.errorNo,
      error: body.errorMsg,
      detail: body.errorMsg
    };
  }

  return result;
}

function onMessage(payload, options, cb) {
  Logger.trace({ payload }, 'onMessage');
  _searchEntity(payload.entity, payload.searchFilters, options, (err, result) => {
    if (err) {
      Logger.error({ err }, 'Error in onMessage');
      cb(err);
    } else {
      if (_isMiss(result.body)) {
        Logger.trace('onMessage results are a miss');
        // This return payload mimics no results
        cb(null, {
          searchInformation: {
            totalResults: 0
          },
          items: []
        });
      } else {
        const details = _formatDetails(result.body, options);
        Logger.trace({ details }, 'onMessage');
        cb(null, details.searchResults);
      }
    }
  });
}

function validateOptions(userOptions, cb) {
  let errors = [];
  if (
    typeof userOptions.apiKey.value !== 'string' ||
    (typeof userOptions.apiKey.value === 'string' && userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: 'apiKey',
      message: 'You must provide a valid Google API key'
    });
  }
  cb(null, errors);
}

module.exports = {
  doLookup,
  startup,
  onMessage,
  validateOptions
};
