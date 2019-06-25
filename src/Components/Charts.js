import React, { Component } from 'react';
import { connect } from 'react-redux';

import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries} from 'react-vis';

import LoadingSpinner from './LoadingSpinner';

import states from '../asyncRequestStates';

import { withStyles } from '@material-ui/core/styles';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    chart: {
        margin: 'auto'
    }
})

class Charts extends Component {

    render(){

        const data = [
            {x: 0, y: 8},
            {x: 1, y: 5},
            {x: 2, y: 4},
            {x: 3, y: 9},
            {x: 4, y: 1},
            {x: 5, y: 7},
            {x: 6, y: 6},
            {x: 7, y: 3},
            {x: 8, y: 2},
            {x: 9, y: 0}
          ];

        return (
            <div className="chart">
                <XYPlot height={300} width= {300}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalBarSeries data={data} />
                </XYPlot>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts));