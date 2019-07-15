import ndjson from 'ndjson';

import { apiUrl } from './config';

const fetchOptions = {
    credentials: 'include'
}

const postOptions = {
    ...fetchOptions,
    method: 'POST',
    headers: {"Content-Type": "application/json"}
}

const storedProcedureParametersToUri = (parameters) => {
    return Object.keys(parameters).reduce(function (queryString, key, i) {
        return `${queryString}${i===0 ? '' : '&&'}${key}=${parameters[key]}`;
      }, '');
}

const api = {};
api.user = {};
api.dataRetrieval = {};
api.catalog = {};
api.visualization = {};

api.user.login = (user) => {
    return fetch(apiUrl + '/user/signin', {
        ...postOptions,
        body: JSON.stringify(user),
    });
}

api.user.logout = () => {
    return fetch(apiUrl + '/user/signout', fetchOptions);
}

api.user.register = (user) => {
    return fetch(apiUrl + '/user/signup', {
        ...postOptions,
        body: JSON.stringify(user),
    })
}

api.user.validate = (user) => {
    return fetch(apiUrl + '/user/validate', {
        ...postOptions,
        body: JSON.stringify(user),
    })
}

api.catalog.retrieve = async() => {

    const decoder = new TextDecoder();
    let catalog = [];

    let ndjsonParser = ndjson.parse();
    ndjsonParser.on('data', data => {
        catalog.push(data);
    })

    let response = await fetch(apiUrl + '/catalog/', fetchOptions);

    if(!response.ok) return false;

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            ndjsonParser.write(decoder.decode(chunk.value));
        };
    }
    return catalog;
}

api.user.keyRetrieval = async() => {
    let response = await fetch(apiUrl + '/user/retrieveapikeys', fetchOptions);
    if(!response.ok) return false;
    return await response.json();
}

api.user.keyCreation = async(description) => {
    return await fetch(apiUrl + `/user/generateapikey?description=${description.trim()}`, fetchOptions);
}

api.visualization.queryRequest = async(query) => {
    const decoder = new TextDecoder();
    let vizData = [];

    let ndjsonParser = ndjson.parse();

    ndjsonParser.on('data', data => {
        vizData.push(data);
    })

    let response = await fetch(apiUrl + '/dataretrieval/query?query=' + query, fetchOptions);

    if(!response.ok) return false;

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            ndjsonParser.write(decoder.decode(chunk.value));
        };
    }
    return vizData;
}

api.visualization.storedProcedureRequest = async(parameters) => {
    const decoder = new TextDecoder();
    let vizData = [];

    let ndjsonParser = ndjson.parse();

    ndjsonParser.on('data', data => {
        vizData.push(data);
    })

    let response = await fetch(apiUrl + '/dataretrieval/sp?' + storedProcedureParametersToUri(parameters), fetchOptions);

    if(!response.ok) return false;

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            ndjsonParser.write(decoder.decode(chunk.value));
        };
    }
    return vizData;
}

export default api;