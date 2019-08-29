'use strict';

class DialogflowFulfillmentHandler {

    constructor(request) {
        this.request_ = request;
        this.responses_ = [];
        this.outputContexts_ = {};
        this.followUpEvent_ = null;
        this.session_ = this.request_.session;
        this.userIdentification_ = this.session__.split('/').slice(-1)[0];
        this.intent_ = this.request_.queryResult.intent.displayName;
    }

    getFollowUpEvent() {
        return this.followUpEvent_
    }

    getIntent() {
        return this.intent_
    }

    setFollowUpEvent(intentName, parameters) {
        this.followUpEvent_ = {
            "name": intentName,
            "parameters": parameters
        }
    }

    getUserIdentification() {
        return this.userIdentification_;
    }

    addOutputContext(name, parameters, lifespan) {
        let contextData = {
            "name": `${this.session_}/contexts/${name}`,
            "lifespanCount": lifespan,
            "parameters": parameters
        };
        this.outputContexts_[contextData.name] = contextData;
    }

    deleteContext(name) {
        let contextData = {
            "name": `${this.session_}/contexts/${name}`,
            "lifespanCount": 0
        };
        this.outputContexts_[contextData.name] = contextData;
    }

    addPayload(fields) {
        let payload = {
            "payload": fields
        };
        this.responses_.push(payload);
    }

    addText(text) {
        let normalText = {
            "text": {
                text
            }
        };
        this.responses_.push(normalText);
    }

    addOptions(options) {
        let index = 1;
        let textToPush = '';
        options.forEach((opt) => {
            textToPush += `${index} - ${opt}\n`;
            index++;
        });
        let text = [];
        text.push(textToPush);
        let normalOptions = {
            "text": {
                text
            }
        };
        this.responses_.push(normalOptions);
    }

    addPdfFacebook(fileURL) {
        let payload = {
            "facebook": {
                "attachment": {
                    "type": "file",
                    "payload": {
                        "url": fileURL
                    }
                }
            }
        };
        let msg = {
            'payload': payload
        };
        this.responses_.push(msg);
    }

    getParametersFromContext() {
        let req = this.request_.queryResult;
        try {
            let i = 0;
            let maxContext = {};
            if (req.outputContexts) {
                for (i; i < Object.keys(req.outputContexts).length; i++) {
                    let currentContext = req.outputContexts[i];
                    if (!maxContext.parameters && currentContext.parameters) {
                        maxContext = currentContext;
                    } else if (currentContext.parameters && currentContext.parameters.dateTime && maxContext.parameters && currentContext.parameters.dateTime > maxContext.parameters.dateTime) {
                        maxContext = currentContext;
                    }
                }

                if (maxContext && maxContext.parameters && maxContext.parameters.registry && maxContext.parameters.registry.registry && maxContext.parameters.registry.registry != "") {
                    maxContext.parameters.registry = ResolveParametro(maxContext.parameters.registry.registry);
                    console.log(`Max context parameters: ${JSON.stringify(maxContext.parameters)}`);
                    return maxContext.parameters;
                } else {
                    console.log(`Max context parameters: ${JSON.stringify(maxContext.parameters)}`);
                    return maxContext.parameters;
                }
            }
        } catch (err) {
            console.log(err);
        }
        return undefined;
    }

    getInputContexts() {
        if (this.request_.queryResult.outputContexts) {
            let contexts = {}
            for (let context of this.request_.queryResult.outputContexts) {
                contexts[context.name] = context
            }
            return contexts
        } else {
            return {}
        }
    }

    createFulfillmentResponse() {
        let responses = this.responses_;
        let followupEventInput = this.followUpEvent_;
        let outputContexts = [];
        for (let key in Object.keys(this.outputContexts_)) {
            outputContexts.push(this.outputContexts_[key])
        }

        let fulfillmentResponse = {};
        if (responses && Object.keys(responses).length > 0) {
            fulfillmentResponse.fulfillmentMessages = responses;
        }
        if (outputContexts) {
            fulfillmentResponse.outputContexts = outputContexts;
        }
        if (followupEventInput) {
            fulfillmentResponse.followupEventInput = followupEventInput;
        }

        if (fulfillmentResponse.followupEventInput) {
            console.log(`Replying to dialogFlow followupEventInput: ${JSON.stringify(fulfillmentResponse.followupEventInput)}`);
        }
        if (fulfillmentResponse.outputContexts) {
            console.log(`Replying to dialogFlow outputContexts: ${JSON.stringify(fulfillmentResponse.outputContexts)}`);
        }
        if (fulfillmentResponse.fulfillmentMessages) {
            console.log(`Replying to dialogFlow fulfillmentMessages [truncated at 1000]: ${JSON.stringify(fulfillmentResponse.fulfillmentMessages.slice(0, 1000))}`);
        }

        return fulfillmentResponse;
    }


}

module.exports = {
    DialogflowFulfillmentHandler
};