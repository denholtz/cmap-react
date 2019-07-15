import React from 'react';

import { Link } from 'react-router-dom';

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
        textDecoration:'none'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const GoBackButton = (props) => {
    const { classes, showCharts } = props;

    return (
        <div>
            <Paper className={classes.buttonPaper} onClick={props.toggleChartView}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>{props.showCharts ? 'Maps' : 'Charts'}</h6>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(GoBackButton);