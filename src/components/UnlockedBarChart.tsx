import React from 'react';
import * as d3 from 'd3';

type StringKeyAnyValue = { [key: string]: any };
type StringKeyNumberValue = { [key: string]: number };

interface Props {
  achievements: any[];
  players: StringKeyAnyValue;
}

const getCountsByPlayer = (achievements: any[]) => {
  const countsByPlayer: StringKeyNumberValue = {}
  for (const achievement of achievements) {
    for (const steamID in achievement.players) {
      const status = achievement.players[steamID]
      if (typeof countsByPlayer[steamID] === 'undefined') {
        countsByPlayer[steamID] = 0
      }
      if (status.isUnlocked) {
        countsByPlayer[steamID]++
      }
    }
  }
  return countsByPlayer
}

const getUnlockedCounts = (countsByPlayer: StringKeyNumberValue, players: StringKeyAnyValue) => {
  const data = []
  for (const steamID in countsByPlayer) {
    let label = players[steamID].personaname
    if (label.length > 17) {
      label = label.slice(0, 14) + '...'
    }
    data.push({ label: label, value: countsByPlayer[steamID] })
  }
  data.sort((a, b) => a.value < b.value ? 1 : a.value > b.value ? -1 : 0)
  return data
}

const UnlockedBarChart = ({ achievements, players }: Props) => {
  const countsByPlayer = getCountsByPlayer(achievements)
  const playerCount = Object.keys(players).length
  const margin = {top: 10, right: 0, bottom: 30, left: 43}
  const width = Math.min(960, 150 * playerCount) - margin.left - margin.right
  const height = 230 - margin.top - margin.bottom
  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
  const y = d3.scaleLinear().range([height, 0])
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y).ticks(5)
  const data = getUnlockedCounts(countsByPlayer, players)
  const svg = d3.select('#unlockedBarChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  x.domain(data.map(d => d.label))
  y.domain([0, d3.max(data, d => d.value)])
  svg.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis)
  svg.append('g').attr('transform', 'translate(-10,0)').call(yAxis)
    .append('text').attr('transform', 'rotate(-90)')
    .attr('y', 6).attr('dy', '.71em')
    .style('text-anchor', 'end').text('# Unlocked')
  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('x', d => x(d.label))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value))
  svg.selectAll('.bar').data(data).enter().append('text')
    .text(d => d.value > 5 ? d.value : '')
    .attr('x', (d, _) => x(d.label) + 8)
    .attr('y', d => y(d.value) + 21)

  return <div id="unlockedBarChart"></div>
}

export default UnlockedBarChart;
