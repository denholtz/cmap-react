import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import Slider from '@material-ui/lab/Slider';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    controlPanel: {
        width: '180px',
        height: '280px',
        padding: theme.spacing(1.5),
        position:'fixed',
        left: '10px',
        top: '80px',
        zIndex: 2
    },
    slider: {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
    }
})

const VisualizationController = (props) => {
    const {classes} = props;

    return (
        <div>
            <Paper className={classes.controlPanel}>

                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Variable</FormLabel>
                    <RadioGroup
                        aria-label="Variable"
                        name="variable"
                        value={props.variable}
                        onChange={props.handleVariableChange}
                        >
                        <FormControlLabel value="SiO2_darwin_3day" control={<Radio />} label="SiO2" />
                        <FormControlLabel value="PO4_darwin_3day" control={<Radio />} label="PO4" />
                        <FormControlLabel value="DIN_darwin_3day" control={<Radio />} label="DIN" />
                    </RadioGroup>
                </FormControl>
                <Divider/>
                <div className={classes.slider}>
                    <Typography variant='h6'>Date</Typography>
                    <Slider
                        value={props.dateSliderPosition}
                        min={3}
                        max={24}
                        step={3}
                        onChange ={props.handleDateSliderChange}
                        disabled={!props.hasData}
                    />
                    <Typography> {`1994-01-${props.dateSliderPosition}`}    </Typography>
                </div>

                <div className={classes.slider}>
                    <Typography variant='h6'>Opacity</Typography>
                    <Slider
                        value={props.opacity}
                        min={.1}
                        max={1}
                        step={.1}
                        onChange ={props.handleOpacitySliderChange}
                    />
                    <Typography> {props.opacity}    </Typography>
                </div>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(VisualizationController);