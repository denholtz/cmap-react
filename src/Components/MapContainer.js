import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Scene, loadModules } from '@esri/react-arcgis';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    container: {
        margin: '0 auto 0 auto',
        width: '55vw',
        height: '35vw',
    }
})

class UiComponents extends React.Component {

    shouldComponentUpdate = (nextProps, nextState) => {
        return false;
    }

    render() { 
        var measurementWidget = new this.props.esriModules.AreaMeasurement3D({view: this.props.view})
        measurementWidget.watch('viewModel.measurement.area.text', () => {
            this.props.updateMapFromDomain(measurementWidget.viewModel.tool.model.viewData.positionsGeographic);
        })    
    
        this.props.view.ui.add(measurementWidget, 'top-right');
        this.props.view.ui.add(new this.props.esriModules.Search({view: this.props.view}),'bottom-right')
        // this.props.view.ui.add(new this.props.esriModules.Fullscreen({view: this.props.view}),'bottom-left')
        return null;
    }
}

class MapContainer extends Component {

    render(){
        const { classes } = this.props;

        return (
            <div className={classes.container}>
                <Scene
                    mapProperties={{ basemap: 'satellite' }}
                    viewProperties={{
                        center: [-140, 30],
                        zoom: 3
                    }}
                >
                    <UiComponents
                        updateMapFromDomain={this.props.updateMapFromDomain}
                        esriModules={{...this.props.esriModules}}
                        measurementPositions={this.props.measurementPositions}
                    />
                </Scene>    
            </div>
            
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MapContainer));