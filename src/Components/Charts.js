import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import subType from '../Enums/visualizationSubTypes';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    chartsWrapperUIHidden: {
        margin: '60px 0 0 100px'
    },

    chartsWrapper: {
        margin: '300px 0 0 100px'
    }
})

const handleContourMap = (chart) => ({
    data:[
        {
            x: chart.data.map(row => row.lon),
            y: chart.data.map(row => row.lat),
            z: chart.data.map(row => row[chart.parameters.fields]),
            name: chart.parameters.fields,
            type: 'contour',
            contours: {
                coloring: 'heatmap',
                showlabels: true,
                labelfont: {
                    family: 'Raleway',
                    size: 12,
                    color: 'white',
                }
            }
        }
    ],
    layout: {
        title: chart.parameters.fields,
                xaxis: {title: 'Longitude'},
                yaxis: {title: 'Latitude'}
    }
})

const handleHistogram = (chart) => ({        
        data: [
            {
            x: chart.data.map(row => row[chart.parameters.fields]),
            name: chart.parameters.fields,
            type: 'histogram',
            marker: {color: '#17becf'}
            }
        ],
        layout: {
            title: `${chart.parameters.fields} - ${chart.subType}`,
            xaxis: {title: chart.parameters.fields}
        }          
})

const handleTimeSeries = (chart) => ({
    data: [
      {
      x: chart.data.map(row => row.time),
      y: chart.data.map(row => row[chart.parameters.fields]),
      error_y: {
        type: 'data',
        array: chart.data.map(row => row[chart.parameters.fields + '_std']),
        opacity: 0.2,
        color: 'gray',
        visible: true
      },
      name: chart.parameters.fields,
      type: 'scatter',
      line: {color: '#e377c2'},
      },
    ],
    layout: {
      title: `${chart.parameters.fields} - ${chart.subType}`,
      xaxis: {title: 'Time'},
      yaxis: {title: chart.parameters.fields}
    }
  })

const handleSectionMap = (chart) => ({
    data: [
      {
      x: chart.data.map(row => row.lat),
      y: chart.data.map(row => row.depth),
      z: chart.data.map(row => row[chart.parameters.fields]),
      name: chart.parameters.fields,
      type: 'heatmap',
      }
    ],
    layout: {
      title: `${chart.parameters.fields}`,
      xaxis: {title: 'Latitude'},
      yaxis: {autorange: 'reversed', title: 'Depth [m]'}
    }
  })

const handleDepthProfile = (chart) => ({
    data: [
      {
        x: chart.data.map(row => row.depth),
        y: chart.data.map(row => row[chart.parameters.fields]),
        error_y: {
          type: 'data',
          array: chart.data.map(row => row[chart.parameters.fields] + '_std'),
          opacity: 0.2,
          color: 'gray',
          visible: true
        },
        name: chart.parameters.fields,
        type: 'scatter',
        line: {color: '#e377c2'},
        },
    ],
    layout: {
      title: chart.parameters.fields,
      xaxis: {title: 'Depth [m]'},
      yaxis: {title: chart.parameters.fields}
    }
  })

class Charts extends Component {

    render(){

        const { classes, charts } = this.props;

        const processedCharts = charts.map(chart => {
            switch(chart.subType){
                case 'Contour Map':
                    return handleContourMap(chart);
                case 'Histogram':
                    return handleHistogram(chart);
                case 'Time Series':
                    return handleTimeSeries(chart);
                case 'Section Map':
                    return handleSectionMap(chart);
                case 'Depth Profile':
                    return handleDepthProfile(chart);
                default:
                    console.log(`Subtype not found: ${chart.subType}`);
                    return null;
            }
        })

        return (
            <div className={classes.chartsWrapper}>
                {processedCharts.map((chart, index) => (
                    <Plot
                        key={index}
                        layout= {chart.layout}
                        data={chart.data}
                    />
                ))}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts));