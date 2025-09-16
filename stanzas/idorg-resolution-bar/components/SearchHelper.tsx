import React from 'react';
import SearchStates from "./SearchStates";
import config from "./config";
import EbiSearchNamespaceEntry from './EbiSearchNamespaceEntry'
import { evaluateQuery } from './identifiers';

interface SearchHelperProps {
  loading: boolean,
  setSearchState: (symbol: SearchStates) => void,
  query: string,
  namespaceList: EbiSearchNamespaceEntry[],
}

class SearchHelper extends React.Component<SearchHelperProps> {
  copyToClipboard = (text: string, ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();
    navigator.clipboard.writeText(text).then(
      () => {
        alert('Copied to clipboard')
      },
      (err) => {
        alert(`Failed to copy to clipboard: ${err}`);
      }
    );
  }

  shouldComponentUpdate(nextProps: SearchHelperProps, nextState: SearchHelperProps) {
    return !nextProps.loading;
  }

  render() {
    const { namespaceList, query, setSearchState } = this.props;
    const [evaluation, queryParts] = evaluateQuery(query, namespaceList);

    setSearchState(evaluation);

    const idorgURI = evaluation === SearchStates.VALID_CURIE && queryParts?.id && queryParts?.prefix ?
      `${config.resolverHardcodedUrl}/${queryParts.prefix}:${queryParts.id}` : null

    return (
      <>
        <div className="row g-0 ms-3 me-2">
          <div className="col d-flex align-items-center">
            {(() => {
              switch (evaluation) {
                case SearchStates.VALID_CURIE:
                  return <i className="icon icon-common icon-check-circle size-200 text-success mr-2"/>
                case SearchStates.NO_CURIE: case SearchStates.QUERYING_NAMESPACES:
                  return <i className="icon icon-common icon-info size-200 text-primary mr-2"/>
                case SearchStates.PREFIX_ONLY: case SearchStates.PREFIX_WITH_COLON:
                  return <i className="icon icon-common icon-exclamation-triangle size-200 text-warning mr-2"/>
                case SearchStates.INVALID_PREFIX: case SearchStates.INVALID_LOCAL_ID:
                  return <i className="icon icon-common icon-times-circle size-200 text-danger mr-2"/>
              }
            })()}
            {(() => {
              switch (evaluation) {
                case SearchStates.VALID_CURIE:
                  return (
                    <small className="text-block me-0">
                      Your compact identifier appears to be valid. <br/> Make sure the URI takes you where you expect it to.
                    </small>
                  );
                case SearchStates.NO_CURIE:
                  return (
                    <small className="text-block me-1 ms-2 mb-3">
                      You are expected to type a compact identifier in this box in the format {'[prefix]:[id]'}. <br/>
                      If you don't know which prefix to use for an data object:
                      <ul>
                        <li>Describe its repository or its data type, then click on a suggestion that looks right.</li>
                        <li>Avoid describing data objects. We don't index individual objects.</li>
                        <li>Short text works better. Not too short though.</li>
                        <li>Adding the ID of an object will sort results using the registry's ID patterns.</li>
                        <li>If you can't find a namespace you can use, use the feedback button above.</li>
                      </ul>
                    </small>
                  );
                case SearchStates.INVALID_PREFIX:
                  return (
                    <small className="text-block me-0">
                      Your compact identifier appears to be incorrect.{' '}
                      {query?.split(/\s+/).length === 1 && <>
                        The prefix{' '}
                        <span className="font-weight-bold">{queryParts.prefixEffectiveValue}</span>{' '}
                        does not exist in the registry.{' '}
                      </>}
                      {namespaceList.length > 0 && <>Try one of the suggestions below.</>}
                    </small>
                  );
                case SearchStates.PREFIX_ONLY:
                  return (
                    <small className="text-block me-0">
                      You have a valid prefix, but your compact identifier is incomplete. Please add a colon and object ID.
                    </small>
                  );
                case SearchStates.PREFIX_WITH_COLON:
                  return (
                    <small className="text-block me-0">
                      You are just missing the object ID to finish the compact identifier.
                    </small>
                  );
                case SearchStates.INVALID_LOCAL_ID: {
                  const currentNamespace = namespaceList.filter(namespace => namespace.prefix === queryParts.prefixEffectiveValue)[0];
                  return (
                    <small className="text-block me-0">
                      Your compact identifier appears to be incorrect: The local id{' '}
                      <span className="font-weight-bold">{queryParts.id}</span>{' '}
                      does not match the pattern{' '}
                      <span className="text-monospace">{currentNamespace? currentNamespace.lui_pattern : ''}</span>.
                    </small>
                  );
                }
              }
            })()}
          </div>
        </div>

        <div className="row g-0 ms-3 me-2">
          <div className="col ms-5">
            <div className="table-responsive">
              <table className="table table-borderless">
                <tbody>
                  {queryParts?.resource ?
                    (
                      <tr>
                        <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Resource:</small></td>
                        <td className="p-0 text-block"><small>{queryParts.resource || 'default'}</small></td>
                      </tr>
                    ) : null
                  }
                  <tr>
                    <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Prefix:</small></td>
                    <td className="p-0 text-block"><small>{queryParts.prefix || 'empty'}</small></td>
                  </tr>
                  <tr>
                    <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>Local id:</small></td>
                    <td className="p-0 text-block"><small>{queryParts.id || 'empty'}</small></td>
                  </tr>
                  { idorgURI &&
                    <tr>
                      <td className="w-25 p-0 font-weight-light font-italic text-muted"><small>URI:</small></td>
                      <td className="p-0 text-block">
                        <small>
                          <a href={idorgURI} target='_blank'>{idorgURI}</a>
                          <button className='text-muted ms-1' title='copy to clipboard'
                            onClick={(ev: any) => this.copyToClipboard(idorgURI, ev)}>
                            <i className="icon icon-common icon-copy"></i>
                          </button>
                        </small>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default SearchHelper;
