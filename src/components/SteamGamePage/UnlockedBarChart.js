import React, { Component, PropTypes } from 'react';
import s from './SteamGamePage.scss';
import d3 from 'd3';

class UnlockedBarChart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {countsByPlayer: this.getCountsByPlayer(props.achievements)};
  }

  componentDidMount() {
    const playerCount = Object.keys(this.props.players).length;
    const margin = {top: 0, right: 0, bottom: 30, left: 40};
    const widthPerBar = 190;
    const width = (widthPerBar * playerCount) - margin.left - margin.right;
    const height = 230 - margin.top - margin.bottom;
    const x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    const y = d3.scale.linear().range([height, 0]);
    const xAxis = d3.svg.axis().scale(x).orient('bottom');
    const yAxis = d3.svg.axis().scale(y).orient('left').ticks(5);
    const data = this.getUnlockedCounts();
    const svg = d3.select('#unlockedBarChart').append('svg').
                   attr('width', width + margin.left + margin.right).
                   attr('height', height + margin.top + margin.bottom).
                   append('g').
                   attr('transform',
                        'translate(' + margin.left + ',' + margin.top + ')');
    x.domain(data.map((d) => d.label));
    y.domain([0, d3.max(data, (d) => d.value)]);
    svg.append('g').attr('class', [s.x, s.axis].join(' ')).
        attr('transform', 'translate(0,' + height + ')').call(xAxis);
    svg.append('g').attr('class', [s.y, s.axis].join(' ')).
        attr('transform', 'translate(-8,0)').call(yAxis).
        append('text').attr('transform', 'rotate(-90)').
        attr('y', 6).attr('dy', '.71em').
        style('text-anchor', 'end').text('# Unlocked');
    svg.selectAll('.bar').data(data).enter().append('rect').
        attr('class', s.bar).attr('x', (d) => x(d.label)).
        attr('width', x.rangeBand()).
        attr('y', (d) => y(d.value)).
        attr('height', (d) => height - y(d.value));
    svg.selectAll('.bar').data(data).enter().append('text').
        text((d) => d.value).
        attr('x', (d, i) => x(d.label) + 8).
        attr('y', (d) => y(d.value) + 21).
        attr('class', s.label);
  }

  getUnlockedCounts() {
    var data = [];
    for (var steamId in this.state.countsByPlayer) {
      data.push({
        label: this.props.players[steamId].personaname,
        value: this.state.countsByPlayer[steamId]
      });
    }
    data.sort((a, b) => a.label.localeCompare(b.label));
    return data;
  }

  getCountsByPlayer(achievements) {
    var countsByPlayer = {};
    for (var i = 0; i < achievements.length; i++) {
      var achievement = achievements[i];
      for (var steamId in achievement.players) {
        var status = achievement.players[steamId];
        if (typeof countsByPlayer[steamId] === 'undefined') {
          countsByPlayer[steamId] = 0;
        }
        if (status.isUnlocked) {
          countsByPlayer[steamId]++;
        }
      }
    }
    return countsByPlayer;
  }

  render() {
    return (
      <div id="unlockedBarChart" className={s.unlockedBarChart}></div>
    );
  }
}

export default UnlockedBarChart;
