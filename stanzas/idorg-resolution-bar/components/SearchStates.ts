const enum SearchStates {
  NO_CURIE, // Query doesnt look like a curie
  QUERYING_NAMESPACES, // Query is for searching thru namespace
  PREFIX_ONLY, // Only prefix seem to be present
  PREFIX_WITH_COLON, // Only prefix with a colon is present
  VALID_CURIE, // The query seems to be a valid curie
  INVALID_LOCAL_ID, // The query seems to be a curie with invalid ID
  INVALID_PREFIX // The query seems to be a curie with invalid prefix
}
export default SearchStates