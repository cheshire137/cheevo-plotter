import React, { useState } from 'react';

interface Props {
  onChange(activeFilters: string[]): void;
  filteredCount: number;
}

const Filters = ({ onChange, filteredCount }: Props) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [allUnlockedChecked, setAllUnlockedChecked] = useState(false)
  const [noneUnlockedChecked, setNoneUnlockedChecked] = useState(false)

  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id
    let newActiveFilters = [...activeFilters]
    const index = activeFilters.indexOf(id)

    if (event.target.checked) {
      if (id === 'allUnlocked') {
        setNoneUnlockedChecked(false)
        const noneIndex = newActiveFilters.indexOf('noneUnlocked');
        if (noneIndex > -1) {
          newActiveFilters = newActiveFilters.
              slice(0, noneIndex).concat(newActiveFilters.slice(noneIndex + 1));
        }
      } else if (id === 'noneUnlocked') {
        setAllUnlockedChecked(false)
        const allIndex = newActiveFilters.indexOf('allUnlocked')
        if (allIndex > -1) {
          newActiveFilters = newActiveFilters.slice(0, allIndex).concat(newActiveFilters.slice(allIndex + 1))
        }
      }
      if (index < 0) {
        newActiveFilters = newActiveFilters.concat([id])
      }
    } else if (index > -1) {
      newActiveFilters = newActiveFilters.slice(0, index).concat(newActiveFilters.slice(index + 1))
    }

    setActiveFilters(newActiveFilters)
    onChange(activeFilters)
  }

  return <ul>
    <li>Filter achievements:</li>
    <li>
      <input checked={allUnlockedChecked} onChange={e => onFilterChange(e)} type="checkbox" id="allUnlocked" />
      <label htmlFor="allUnlocked">Everyone has unlocked</label>
    </li>
    <li>
      <input checked={noneUnlockedChecked} onChange={e => onFilterChange(e)} type="checkbox" id="noneUnlocked" />
      <label htmlFor="noneUnlocked">No one has unlocked</label>
    </li>
    <li>
      <span>{filteredCount} </span>
      <span>{filteredCount === 1 ? 'achievement' : 'achievements'}</span>
      <span> shown</span>
    </li>
  </ul>
}

export default Filters;
