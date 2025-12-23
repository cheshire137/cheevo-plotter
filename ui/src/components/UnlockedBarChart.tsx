import * as d3 from 'd3'
import {useMemo} from 'react'
import type {SteamPlayerAchievement} from '../types'

function getCountsByPlayer(playerAchievements: SteamPlayerAchievement[]) {
  const countsByPlayer: Record<string, number> = {}
  for (const playerAchievement of playerAchievements) {
    if (countsByPlayer[playerAchievement.steamId] === undefined) {
      countsByPlayer[playerAchievement.steamId] = 0
    }
    if (playerAchievement.unlocked) {
      countsByPlayer[playerAchievement.steamId]++
    }
  }
  return countsByPlayer
}

const getUnlockedCounts = (countsByPlayer: Record<string, number>, playerNamesBySteamId: Record<string, string>) => {
  const data = []
  for (const steamID in countsByPlayer) {
    let label = playerNamesBySteamId[steamID] ?? steamID
    if (label.length > 17) {
      label = label.slice(0, 14) + '...'
    }
    data.push({label: label, value: countsByPlayer[steamID]})
  }
  data.sort((a, b) => (a.value < b.value ? 1 : a.value > b.value ? -1 : 0))
  return data
}

export function UnlockedBarChart({
  playerAchievements,
  playerNamesBySteamId,
}: {
  playerAchievements: SteamPlayerAchievement[]
  playerNamesBySteamId: Record<string, string>
}) {
  const countsByPlayer = getCountsByPlayer(playerAchievements)
  const playerIds = useMemo(() => new Set(playerAchievements.map(pa => pa.steamId)), [playerAchievements])
  const playerCount = playerIds.size
  const margin = {top: 10, right: 0, bottom: 30, left: 43}
  const width = Math.min(960, 150 * playerCount) - margin.left - margin.right
  const height = 230 - margin.top - margin.bottom
  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
  const y = d3.scaleLinear().range([height, 0])
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y).ticks(5)
  const data = getUnlockedCounts(countsByPlayer, playerNamesBySteamId)
  const svg = d3
    .select('#unlockedBarChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  x.domain(data.map(d => d.label))
  const max = d3.max(data, d => d.value) || 0
  y.domain([0, max])
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
  svg
    .append('g')
    .attr('transform', 'translate(-10,0)')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('# Unlocked')
  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.label) || 0)
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value))
  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('text')
    .text(d => (d.value > 5 ? d.value : ''))
    .attr('x', (d, _) => (x(d.label) || 0) + 8)
    .attr('y', d => y(d.value) + 21)

  return <div id="unlockedBarChart"></div>
}
