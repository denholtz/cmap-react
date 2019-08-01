import React from 'react';

import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

const styles = (theme) => ({
    buttonPaper: {
        width: '60px',
        height: '60px',
        padding: theme.spacing(0.5),
        position:'fixed',
        left: '10px',
        top: '90px',
        zIndex: 2,
        textDecoration:'none',
        cursor: 'pointer'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const ToggleChartViewButton = (props) => {
    const { classes, showCharts } = props;

    return (
        <div>            
            <Paper className={classes.buttonPaper} onClick={props.toggleChartView}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>{showCharts ? 'Map' : 'Charts'}</h6>
            </Paper>
        </div>
    )
}

export default connect(mapStateToProps, null)(withStyles(styles)(ToggleChartViewButton));