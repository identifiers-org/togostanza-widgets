import React from 'react';

import SearchStates from './SearchStates'
import SearchSuggestions from './SearchSuggestions';
import config from './config';

interface SearchProps {
  onButtonClick: (query: string | undefined) => void
  textButton: string
  textPlaceholder: string
}

interface SearchState {
  isSearchValid: boolean, 
  showSuggestions: boolean, 
  query: string
}

class Search extends React.Component<SearchProps, SearchState> {
  exampleCuries = Object.freeze([ 'uniprot:P12345', 'pdb:2gc4', 'taxonomy:9606' ])

  search: React.RefObject<HTMLInputElement | null>;
  suggestionListRef: React.RefObject<SearchSuggestions | null>;

  constructor(props : SearchProps) {
    super(props);

    this.state = {
      isSearchValid: false,
      showSuggestions: false,
      query: '',
    }

    this.search = React.createRef<HTMLInputElement>();
    this.suggestionListRef = React.createRef<SearchSuggestions>();
  }

  setSearchState = (currentState : SearchStates) => {
    const isNewStateValid = currentState === SearchStates.VALID_CURIE;
    if (this.state.isSearchValid !== isNewStateValid) {
      this.setState({isSearchValid : isNewStateValid})
    }
  }

  handleFocusShowSuggestions = () => {
    this.setState({
      showSuggestions: true
    })
  };

  closeSuggestions = () => {
    this.setState({
      showSuggestions: false
    })
  }

  handleChange = () => {
    this.setState({
      query: this.search.current?.value || '',
    });
  }

  handleKeyDown = (e: any) => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        if (this.suggestionListRef.current?.hasSelection()) {
          this.suggestionListRef.current?.clickSelection();
        }
        else if (this.state.isSearchValid) {
          this.props.onButtonClick(this.state.query);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection()
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection();
        break;
      }

      case 'PageDown': {
        e.preventDefault();
        this.suggestionListRef.current?.downSelection(5);
        break;
      }

      case 'PageUp': {
        e.preventDefault();
        this.suggestionListRef.current?.upSelection(5);
        break;
      }
    }
  }

  handleSuggestion = (suggestion: any) => {
    this.setState({
      query: suggestion,
      showSuggestions: true,
    }, () => this.search.current?.focus());
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
    this.handleButtonClick();
  }

  handleButtonClick = () => {
    if (this.state.isSearchValid) {
      this.props.onButtonClick(this.state.query);
    }
  }

  handleExampleClick = (e: any) => {
    e.preventDefault();
    if (e.key && e.key !== 'Enter') return; // Check for Enter key keyboard event (For accessibility)
    if (this.search.current != null){
      this.search.current.value = e.target.innerText;
    } 
    this.handleChange();
    this.search.current?.focus();
  }

  render() {
    const {
      props: { textButton, textPlaceholder },
      state: { query, showSuggestions, isSearchValid }
    } = this;

    return (
      <form onSubmit={this.handleSubmit} role='search'>
        <div className="form-group">
          <small className="form-text text-muted ms-1">
            Examples:{' '}
            {
              this.exampleCuries.map(example => (
                <a role='suggestion' key={example} tabIndex={0}
                   onClick={this.handleExampleClick}
                   onKeyDown={this.handleExampleClick}
                   className='text-primary text-decoration-none me-2'>
                  {example}
                </a>
              ))
            }
          </small>
          <div className="input-group">
            <input
              role="searchbox"
              spellCheck={false}
              className="form-control search-input"
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              onFocus={this.handleFocusShowSuggestions}
              placeholder={textPlaceholder}
              ref={this.search}
              value={query}
            />
            <div className="input-group-append">
              <button
                className="btn btn-primary text-white search-button"
                onFocus={this.handleFocusShowSuggestions}
                onClick={this.handleButtonClick}
                disabled={!isSearchValid}
              >
                {textButton}
              </button>
            </div>
            { config.showSearchSuggestions && showSuggestions &&
              <SearchSuggestions
                setSearchState={this.setSearchState}
                closeSuggestions={this.closeSuggestions}
                setSuggestion={this.handleSuggestion}
                suggestionListRef={this.suggestionListRef}
                query={query}
              />
            }
          </div>
        </div>
      </form>
    )
  }
}

export default Search;