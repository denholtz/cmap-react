import * as visualizationActionTypes from '../actionTypes/visualization';

export const queryRequestSend = (query) => ({
    type: visualizationActionTypes.QUERY_REQUEST_SEND,
    payload: {
        query
    }
})

export const queryRequestSuccess = (data) => ({
    type: visualizationActionTypes.QUERY_REQUEST_SUCCESS,
    payload: {
        data
    }
})

export const queryRequestFailure = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_FAILURE
})

export const queryRequestProcessing = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_PROCESSING
})

export const storedProcedureRequestSend = (parameters) => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND,
    payload: {
        parameters
    }
})

export const storedProcedureRequestSuccess = (data) => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SUCCESS,
    payload: {
        data
    }
})

export const storedProcedureRequestFailure = () => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_FAILURE
})

export const storedProcedureRequestProcessing = () => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_PROCESSING
})

export const addLayer = (newLayer) => ({
    type: visualizationActionTypes.ADD_LAYER,
    payload: {
        newLayer
    }
})

export const storeSampleData = sampleData => ({
    type: visualizationActionTypes.STORE_SAMPLE_DATA,
    payload: {
        sampleData
    }
})

export const renderMap = (mapInfo) => ({
    type: visualizationActionTypes.RENDER_MAP,
    payload: {
        mapInfo
    }
})

export const renderChart = (chartInfo) => ({
    type: visualizationActionTypes.RENDER_CHART,
    payload: {
        chartInfo
    }
})