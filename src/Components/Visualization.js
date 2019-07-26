import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import LoginRequiredPrompt from './LoginRequiredPrompt';
// import VisualizationController from './VisualizationController';
import VizTooltip from './VizTooltip';
import LoadingSpinner from './LoadingSpinner';
import DataRetrievalForm from './DataRetrievalForm';
import DebugButton from './DebugButton';
import ClearVisualizationsButton from  './ClearVisualizationsButton';

import { showLoginDialog } from '../Redux/actions/ui';
import { queryRequestSend } from '../Redux/actions/visualization';
import states from '../asyncRequestStates';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import DeckGL, {GeoJsonLayer, ColumnLayer, GridLayer, PointCloudLayer} from 'deck.gl';
import {AmbientLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

import GoBackButton from './GoBackButton';
import Charts from './Charts';
import ToggleChartViewButton from './ToggleChartViewButton';
import ToggleHideUIButton from './ToggleHideUIButton';
import subTypes from '../Enums/visualizationSubTypes';



let colormap = require('colormap')

const paletteSize = 48

let colors = colormap({
    colormap: 'hot',
    format: 'rba',
    alpha: [255,255],
    nshades: paletteSize
})

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

const spatialResolutionToMetersMapping = {
    '1/12° X 1/12°': null,
    '1/2° X 1/2°': null,
    '1/25° X 1/25°': null,
    '1/4° X 1/4°': 30000,
    '1° X 1°': null,
    '4km X 4km': null,
    '70km X 70km': null,
    'Irregular': null
}

// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1000000.0
//   });

// const lightingEffect = new LightingEffect({ambientLight});

const INITIAL_VIEW_STATE = {
  latitude: 35,
  longitude: -50,
  zoom: 3,
  bearing: 0,
  pitch: 10
};

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    sampleData: state.sampleData,
    queryRequestState: state.queryRequestState,
    maps: state.maps,
    charts: state.charts,
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState
})

const mapDispatchToProps = {
    showLoginDialog,
    queryRequestSend
}

const styles = (theme) => ({
    displayNone: {
        display: 'none'
    }
})

const minMax = (array, key) => {
    let min = array[0][key];
    let max = array[0][key];
    for(let i = 0; i < array.length; i ++){
        if(array[i][key] > max || max === null) max = array[i][key];
        if(array[i][key] < min || min === null) min = array[i][key];
    }
    return [min, max];
}

const handleGeoSpatialMap = (map) => {
    if(!map.data.length) {
        console.log(`No data in map ${map.parameters.fields}`);
        console.log(map);
        return;
    }

    let minAndMaxArray = minMax(map.data, map.parameters.fields);
    let min = minAndMaxArray[0];
    let max = minAndMaxArray[1];
    let step = (max - min) / paletteSize;
    console.log(min, max, step);

    console.log(`Rendering ${map.data.length} data points.`);

    const getColor = (row) => {
        let index = Math.floor((row[map.parameters.fields] - min) / step);
        return colors[index] ? colors[index].slice(0,3) : null;
    }

    return new PointCloudLayer({
    id: 'point-cloud-layer',
    data: map.data,
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    sizeUnits:'meters',
    pointSize: 28000,
    getPosition: d => d[map.parameters.fields] ? [d.lon, d.lat] : [600,600],
    getColor,
    opacity: 1,
    // material: null,
    parameters:{
        depthTest: false
      }
  })
}

const handleHexMap = (map) => {
    if(!map.data.length) {
        console.log(`No data in map ${map.parameters.fields}`);
        console.log(map);
        return;
    }

    console.log(`Binning and rendering ${map.data.length} data points.`);

    // const getColorWeight = (point) => point[map.parameters.fields];
    const reducer = (accumulator, point) => accumulator + point[map.parameters.fields];
    const getColorValue = (points) => {
        return points.reduce(reducer, 0)/points.length;
    }

    return new HexagonLayer({
    id: 'hexagon-later',
    radius: 30000,
    data: map.data,
    pickable: false,
    getColorValue,
    // colorAggregation: 'MEAN',
    // getColorWeight,
    getPosition: d => d[map.parameters.fields] ? [d.lon, d.lat] : [0,0],
  })
}

class Visualization extends Component {

    state = {
        filteredData: [],
        dateSliderPosition: 3,
        variable: 'SiO2_darwin_3day',
        opacity: 1,
        pickedIndex: null,
        pickedLon: null,
        pickedLat: null,
        showCharts: false,
        showUI: true
    }

    // createLayers = (maps) => {
    //     let layers = [];
    //     maps.forEach((mapString, index) => {
    //         let mapArr = mapString.split(' ');
    //         switch(mapArr[1]){
    //             case 'grid':
    //                 layers.push(new GridLayer({
    //                     id: 'gpu-grid-layer',
    //                     gpuAggregation: true,
    //                     data: this.props.data[mapArr[0]],
    //                     pickable: true,
    //                     onClick: (info) => console.log(info),
    //                     extruded: false,
    //                     cellSize: 40000,
    //                     getColorValue: (points) => points.reduce((sum, p) => sum += p[mapArr[0]], 0) / points.length,
    //                     // getColorWeight: () => 3,
    //                     // colorRange: [
    //                     //     [255,0,0],
    //                     //     [255,0,0],
    //                     //     [255,0,0],
    //                     //     [255,0,0],
    //                     //     [255,0,0],
    //                     //     [255,0,0]
    //                     // ],
    //                     elevationScale: 4,
    //                     getPosition: d => [d.lon, d.lat],
    //                     // colorAggregation:'MEAN'
    //                   }))
    //                 break;
                    
    //             case 'columns':
    //                 layers.push(new ColumnLayer({
    //                     id: `column-layer`,
    //                     data: this.props.data[mapArr[0]],
    //                     diskResolution: 12,
    //                     radius: 27000,
    //                     extruded: true,
    //                     // pickable: true,
    //                     autoHighlight: true,
    //                     elevationScale: 750000,
    //                     getPosition: d => [d.lon, d.lat],
    //                     getColor: d => [235, 200 - d.SiO2_darwin_3day * 800, 200 - d.SiO2_darwin_3day * 800],
    //                     // getColor: d => d[this.state.variable] != null ? [0,255,0] : [60,60,60],
    //                     getElevation: d => d[mapArr[0]],
    //                     }))
    //                 break;
                
    //                 case 'point':
    //                     layers.push(new PointCloudLayer({
    //                         id: 'point-cloud-layer',
    //                         data: this.props.data[mapArr[0]],
    //                         pickable: false,
    //                         coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    //                         sizeUnits:'meters',
    //                         pointSize: 100000,
    //                         getPosition: d => [d.lon, d.lat],
    //                         // getNormal: d => d.normal,
    //                         getColor: d => [235, 200 - d.SiO2_darwin_3day * 800, 200 - d.SiO2_darwin_3day * 800],
    //                       }))
    //                     break;

    //                 default:
    //                     break;
    //                 }
    //             })
    
    //     return layers;
    // }

    componentDidMount(){
        if(this.props.sampleData) this.handleDateSliderChange(null, 3);
    }

    componentDidUpdate(prevProps){
        // Filter data on starting date
        if(!prevProps.sampleData && this.props.sampleData){
            this.handleDateSliderChange(null, 3);
        }

        // Send query after user login
        // if(!prevProps.user && this.props.user && !this.props.sampleData){
        //     this.props.queryRequestSend(testQuery);
        // }
    }

    handleDateSliderChange = (event, value) => {
        this.setState({...this.state, 
            dateSliderPosition: value,
            pickedInfo: null,
            filteredData: this.props.sampleData.filter(datum => datum.time === `1994-01-${this.state.dateSliderPosition > 9 ? this.state.dateSliderPosition : "0" + this.state.dateSliderPosition}T00:00:00.000Z`)
        });
    }

    handleOpacitySliderChange = (event, value) => {
        this.setState({...this.state, opacity: value})
    }

    handleVariableChange = (event, value) => {
        this.setState({...this.state, 
            variable: value,
            pickedInfo: null,
            filteredData: this.props.sampleData.filter(datum => datum.time === `1994-01-${this.state.dateSliderPosition > 9 ? this.state.dateSliderPosition : "0" + this.state.dateSliderPosition}T00:00:00.000Z`)
        })
    }

    toggleChartView = () => {
        this.setState({...this.state, showCharts: !this.state.showCharts});
    }

    toggleShowUI = () => {
        this.setState({...this.state, showUI: !this.state.showUI});
    }

    render(){
        const { classes } = this.props;
        // const {filteredData} = this.state;

        if(!this.props.user) return <LoginRequiredPrompt/>

        const processedMaps = this.props.maps.map(map => {
            switch(map.subType){
                case subTypes.geospatialMap:
                    return handleGeoSpatialMap(map);
                case subTypes.hexMap:
                    return handleHexMap(map);
                default:
                    console.log(`Unknown map type ${map.subType}`);
            }
        })
  
        return (
            <div>
                <DataRetrievalForm showUI={this.state.showUI}/>
                <GoBackButton/>
                <ToggleChartViewButton toggleChartView={this.toggleChartView} showCharts={this.state.showCharts}/>
                <ToggleHideUIButton toggleShowUI={this.toggleShowUI} showUI={this.state.showUI}/>
                <DebugButton statePieces={['maps','charts', 'storedProcedureRequestState']}/>
                <ClearVisualizationsButton/>
                {this.props.storedProcedureRequestState === states.inProgress && <LoadingSpinner customVariant='centered' size='36'/>}

                <div className={`${classes.deckWrapper} ${this.state.showCharts ? classes.displayNone : ''}`}>
                    {this.props.queryRequestState === states.inProgress && <LoadingSpinner size={80} customVariant={'centered'}/>}
                    {/* <VisualizationController
                        handleDateSliderChange={this.handleDateSliderChange}
                        dateSliderPosition={this.state.dateSliderPosition}
                        opacity={this.state.opacity}
                        handleOpacitySliderChange={this.handleOpacitySliderChange}
                        variable={this.state.variable}
                        handleVariableChange={this.handleVariableChange}
                        hasData={Boolean(this.props.sampleData && this.props.sampleData.length)}
                    /> */}
                    
                    {this.state.pickedInfo && <VizTooltip
                        lat={this.state.pickedLat}
                        lon={this.state.pickedLon}
                        info={this.state.pickedInfo}
                    />}
                    <DeckGL 
                        // effects={[lightingEffect]}
                        material={null}
                        controller
                        parameters={{
                            depthTest: false
                          }}
                        initialViewState={INITIAL_VIEW_STATE}
                        layers= {[
                            new GeoJsonLayer({
                                id:"base-map",
                                data:COUNTRIES,
                                stroked: true,
                                filled: true,
                                lineWidthMinPixels: 1,
                                opacity: 1,
                                getLineDashArray:[3, 3],
                                getLineColor: [0,0,0],
                                getFillColor: [60,60,60]
                            }),
                            ...processedMaps
                        ]
                        }
                    >
                    </DeckGL>
                </div>
                <div className={this.state.showCharts ? '' : classes.displayNone}>
                    {/* <Charts showUI={this.state.showUI}/> */}
                    <Charts/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Visualization));


// Viz demo layers
// new ColumnLayer({
//     id: `SiO2-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 520000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [255,0,0] : [60,60,60],
//     getElevation: d => d[this.state.variable],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'SiO2_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].SiO2_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`SiO2: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
//   }),

//   new ColumnLayer({
//     id: `DIN-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 50000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [0,255,0] : [60,60,60],
//     getElevation: d => d['DIN_darwin_3day'],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'DIN_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].DIN_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`DIN: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
// }),

// new ColumnLayer({
//     id: `PO4-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 2000000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [43, 172, 219] : [60,60,60],
//     getElevation: d => d['PO4_darwin_3day'],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'PO4_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].PO4_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`PO4: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
// })
