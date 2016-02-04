import React from 'react';
import { Line } from 'react-chartjs';
import moment from 'moment';

const chartOptions = {
  scaleShowGridLines: true,
  scaleGridLineColor: 'rgba(0,0,0,.05)',
  scaleGridLineWidth: 1,
  scaleShowHorizontalLines: true,
  scaleShowVerticalLines: true,
  bezierCurve: true,
  bezierCurveTension: 0.4,
  pointDot: true,
  pointDotRadius: 4,
  pointDotStrokeWidth: 1,
  pointHitDetectionRadius: 20,
  datasetStroke: true,
  datasetStrokeWidth: 2,
  datasetFill: true,
  responsive: true,
  maintainAspectRatio: false,
  legendTemplat: `
    <ul class="<%=name.toLowerCase()%>-legend">
      <% for (var i=0; i<datasets.length; i++){%>
        <li>
          <span style="background-color:<%=datasets[i].strokeColor%>"></span>
          <%if(datasets[i].label){%><%=datasets[i].label%><%}%>
        </li>
      <%}%>
    </ul>`,
  scaleLabel: '<%= value %> Mb/s',
  scaleSteps: 5,
  multiTooltipTemplate: '<%=datasetLabel%>: <%= value %> Mb/s',
};

export default class DownloadUploadChart extends React.Component {

  static propTypes = {
    stats: React.PropTypes.object,
    loading: React.PropTypes.bool.isRequired,
    error: React.PropTypes.object,
    width: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
  };

  _mapChartData(stats) {
    function withResults(speedtest) {
      return !!speedtest.result;
    }

    return {
      labels: stats
        .filter(withResults)
        .map(speedtest => moment(speedtest.startTime).format('DD.MM.YYYY HH:mm')),
      datasets: [
        {
          label: 'download',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: stats
            .filter(withResults)
            .map(speedtest => speedtest.result.speeds.download),
        }, {
          label: 'upload',
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: stats
            .filter(withResults)
            .map(speedtest => speedtest.result.speeds.upload),
        },
      ],
    };
  }

  render() {
    const {
      loading,
      error,
      stats,
      height,
      width,
    } = this.props;

    if (loading) {
      return (
        <div>Loading</div>
      );
    }

    if (error) {
      return (
        <div>Whoops error: <pre>{JSON.stringify(error)}</pre></div>
      );
    }

    if (stats) {
      const chartData = this._mapChartData(stats);

      return (
        <div style={{ margin: '20px' }} >
          <Line data={chartData} options={chartOptions} height={height} width={width} />
        </div>
      );
    }

    return (
      <div>The end of the internet</div>
    );
  }
}
