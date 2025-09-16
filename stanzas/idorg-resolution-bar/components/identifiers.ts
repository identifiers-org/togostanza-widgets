//
// evaluateSearch: evaluates the correctness of a search query. Returns a result ('ok', 'warn', 'fail') and
// a description message.
//

import SearchStates from "./SearchStates";

interface QueryParts {
  prefix?: string,
  id?: string,
  prefixEffectiveValue?: string,
  idWithEmbeddedPrefix?: string,
  resource?: string
}

export const evaluateQuery = function (query: string, namespaceList: any[]) : [SearchStates, QueryParts] {
  if (!query) return [SearchStates.NO_CURIE, {}];

  if (query.split(/\s+/).length > 1) return [SearchStates.NO_CURIE, {}]

  const queryParts = querySplit(query)

  // Case analysis for incorrect identifier strings:
  // 1. Empty prefix.
  if (!queryParts.prefix) {
    return [SearchStates.NO_CURIE, queryParts];
  }

  // 2. Non-existant prefix.
  if (namespaceList.filter(namespace => namespace.prefix === queryParts.prefixEffectiveValue).length === 0) {
    return [SearchStates.INVALID_PREFIX, queryParts];
  }

  // Below here, we are supposed to have a namespace.
  const currentNamespace = namespaceList.filter(namespace => namespace.prefix === queryParts.prefixEffectiveValue)[0];

  // 3. Empty local id.
  if (queryParts.id === '') {
    if (query.endsWith(':')) {
      return [SearchStates.PREFIX_WITH_COLON, queryParts];
    } else {
      return [SearchStates.PREFIX_ONLY, queryParts];
    }
  }

  // 4. Non-conforming local id.
  const regex = new RegExp(currentNamespace.lui_pattern);
  const matches = queryParts.idWithEmbeddedPrefix?.match(regex) || queryParts.id?.match(regex);

  if (!matches) {
    return [SearchStates.INVALID_LOCAL_ID, queryParts];
  }

  // 99. All ok.
  return [SearchStates.VALID_CURIE, queryParts];
}


/**
 * querySplit: splits a query according to a simplified parsing algorithm.
  */
export const querySplit = function (query: string) : QueryParts {
  if (!query) return {};
  const [prefixSide, ...idSide] = query.split(':');
  const prefixParts = prefixSide.split('/');
  let resource = '';

  if (prefixParts.length > 1) {
    resource = prefixParts.shift() as string
  }

  const prefix = prefixParts.join('/');
  const prefixEffectiveValue = prefix.toLowerCase();
  const id = idSide ? idSide.join(':') : '';
  const idWithEmbeddedPrefix = `${prefix}:${id}`;

  return {prefix, prefixEffectiveValue, id, idWithEmbeddedPrefix, resource};
}


//
// completeQuery: completes a identifier string by concatenating the different parts,
// and optionally adding resource and its trailing / or not.
// Also, if the namespace is special (prefix embedded in LUI), take prefix from pattern instead, because
// they are allowed to have caps.
export const completeQuery = (resource: any, namespace: any, id: string) => {
  const prefix = namespace.namespaceEmbeddedInLui ? namespace.pattern.slice(1).split(':')[0].replace(/[\(\/\\\)]/gm, '') : namespace.prefix;

  return `${resource ? resource + '/' : ''}${prefix}:${id}`;
};
