'use strict';
const generalConfigs = require(path.resolve(__dirname, 'config/config.json'));
const stage = process.env['STAGE'];
const configs = generalConfigs[stage];
if (!configs) {
    console.error(`Lambda initialization failed. Invalid STAGE=${stage}`);
    process.exit(1);
}

const {DialogflowUtil} = require('./lib');

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

        const agent = DialogflowUtil.DialogflowFulfillmentHandler(event.body);

        done(false, agent.createFulfillmentResponse())

    } catch (e) {
        console.log(e);
    }
};
