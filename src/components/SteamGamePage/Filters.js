import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import s from './SteamGamePage.scss';

class Filters extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {activeFilters: []};
  }

  onFilterChange(event) {
    const id = event.target.id;
    var activeFilters = this.state.activeFilters;
    const index = activeFilters.indexOf(id);
    if (event.target.checked) {
      if (id === 'allUnlocked') {
        ReactDOM.findDOMNode(this.refs.noneUnlocked).checked = false;
        const noneIndex = activeFilters.indexOf('noneUnlocked');
        if (noneIndex > -1) {
          activeFilters = activeFilters.
              slice(0, noneIndex).concat(activeFilters.slice(noneIndex + 1));
        }
      } else if (id === 'noneUnlocked') {
        ReactDOM.findDOMNode(this.refs.allUnlocked).checked = false;
        const allIndex = activeFilters.indexOf('allUnlocked');
        if (allIndex > -1) {
          activeFilters = activeFilters.
              slice(0, allIndex).concat(activeFilters.slice(allIndex + 1));
        }
      }
      if (index < 0) {
        activeFilters = activeFilters.concat([id]);
      }
    } else if (index > -1) {
      activeFilters = activeFilters.slice(0, index).
                                    concat(activeFilters.slice(index + 1));
    }
    this.setState({activeFilters: activeFilters});
    this.props.onChange(activeFilters);
  }

  render() {
    return (
      <div className={s.filtersWrapper}>
        <ul className={s.filters}>
          <li className={s.header}>
            Filter achievements:
          </li>
          <li>
            <input onChange={this.onFilterChange.bind(this)} type="checkbox"
                   id="allUnlocked" ref="allUnlocked"
                   className={s.filterToggle} />
            <label className={s.label} htmlFor="allUnlocked">
              Everyone has unlocked
            </label>
          </li>
          <li>
            <input onChange={this.onFilterChange.bind(this)} type="checkbox"
                   id="noneUnlocked" ref="noneUnlocked"
                   className={s.filterToggle} />
            <label className={s.label} htmlFor="noneUnlocked">
              No one has unlocked
            </label>
          </li>
        </ul>
      </div>
    );
  }
}

export default Filters;
