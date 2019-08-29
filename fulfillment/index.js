'use strict';
const path = require('path');
const generalConfigs = require(path.resolve(__dirname, 'config/config.json'));
const stage = process.env['STAGE'];
const configs = generalConfigs[stage];
if (!configs) {
    console.error(`Lambda initialization failed. Invalid STAGE=${stage}`);
    process.exit(1);
}

const {DialogflowUtil} = require('./lib');
const intentHandler = require('./intentHandler');

exports.handler = async (event, context, callback) => {

    const done = (err, res) => callback(null, {
        "isBase64Encoded": false,
        statusCode: err ? '400' : '200',
        body: err ? JSON.stringify(err) : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT'
        }
    });

    try {

        if (!event.body) {
            console.log('Empty body received');
            done('Empty body');
            return;
        }

        let body = JSON.parse(event.body)

        const agent = new DialogflowUtil.DialogflowFulfillmentHandler(body);
        if (!agent.isMenu) {
            intentHandler.handleIntent(agent);
        }

        done(false, agent.createFulfillmentResponse())

    } catch (e) {
        console.log(e);
    }
};
