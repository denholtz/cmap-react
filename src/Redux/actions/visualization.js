import * as visualizationActionTypes from '../actionTypes/visualization';

export const queryRequestSend = (query) => ({
    type: visualizationActionTypes.QUERY_REQUEST_SEND,
    payload: {
        query
    }
})

export const queryRequestSuccess = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_SUCCESS
})

export const queryRequestFailure = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_FAILURE
})

export const queryRequestProcessing = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_PROCESSING
})

export const addLayer = (newLayer) => ({
    type: visualizationActionTypes.ADD_LAYER,
    payload: {
        newLayer
    }
})

export const storeSampleData = (sampleData => ({
    type: visualizationActionTypes.STORE_SAMPLE_DATA,
    payload: {
        sampleData
    }
}))