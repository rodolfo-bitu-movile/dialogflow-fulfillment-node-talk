'use strict';

//This intent should exist to handle menu numbers
const MENU_OPTIONS_INTENT = 'special-menu handler';
//It should have this context and should remove it[?] (lifespan 0)
const MENU_OPTIONS_CONTEXT = 'menu-custom-context';
//This should be the parameter configuration in dialogflow (@sys.number-integer)
const MENU_OPTIONS_INTENT_PARAMETER_NAME = 'option-number';
const MENU_OPTIONS_CONTEXT_PARAMETER_NAME = 'options';

class DialogflowFulfillmentHandler {

    constructor(request) {
        console.log(JSON.stringify(request))
        this.request_ = request;
        this.responses_ = [];
        this.outputContexts_ = {};
        this.followUpEvent_ = null;
        this.session_ = this.request_.session;
        this.userIdentification_ = this.session_.split('/').slice(-1)[0];
        this.intent_ = this.request_.queryResult.intent.displayName;
        this.parameters_ = this.request_.queryResult.parameters;
        this.source = null;
        if (this.request_.originalDetectIntentRequest && this.request_.originalDetectIntentRequest.source) {
            this.source = this.request_.originalDetectIntentRequest.source;
        } else if (this.request_.originalDetectIntentRequest && this.request_.originalDetectIntentRequest.payload && this.request_.originalDetectIntentRequest.payload.platform){
            this.source = this.request_.originalDetectIntentRequest.payload.platform
        } else {
            this.source = 'unknown'
        }

        if (this.intent_ === MENU_OPTIONS_INTENT) {
            this.isMenu = true;
            let contexts = this.getInputContexts();
            console.log(JSON.stringify(contexts));
            let options = contexts[MENU_OPTIONS_CONTEXT].parameters[MENU_OPTIONS_CONTEXT_PARAMETER_NAME];
            let optionIndex = this.parameters_[MENU_OPTIONS_INTENT_PARAMETER_NAME] - 1;
            this.setFollowUpEvent(options[optionIndex].eventName, {})

        } else {
            this.isMenu = false
        }
    }

    getFollowUpEvent() {
        return this.followUpEvent_
    }

    getIntent() {
        return this.intent_
    }

    setFollowUpEvent(eventName, parameters) {
        this.followUpEvent_ = {
            "name": eventName,
            "parameters": parameters
        }
    }

    copyResponsesFromDialogflow() {
        this.responses_ = this.request_.queryResult.fulfillmentMessages
    }

    getUserIdentification() {
        return this.userIdentification_;
    }

    addOutputContext(name, parameters, lifespan) {
        let contextData = {
            "name": this.buildContextName(name),
            "lifespanCount": lifespan,
            "parameters": parameters
        };
        this.outputContexts_[contextData.name] = contextData;
    }

    deleteContext(name) {
        let contextData = {
            "name": this.buildContextName(name),
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
            textToPush += `${index} - ${opt.text}\n`;
            index++;
        });
        let text = [];
        text.push(textToPush);
        let normalOptions = {
            "text": {
                text
            }
        };

        let parameters = {};
        parameters[MENU_OPTIONS_CONTEXT_PARAMETER_NAME] = options.map(function (el) {
            return {eventName: el.followUpEvent, text: el.text}
        }) ;
        this.addOutputContext(MENU_OPTIONS_CONTEXT, parameters, 1);
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
            let contexts = {};
            for (let context of this.request_.queryResult.outputContexts) {
                contexts[this.extractNameFromContextIdentificaiton(context.name)] = context
            }
            return contexts
        } else {
            return {}
        }
    }

    getInputParameters() {
        return this.parameters_;
    }

    createFulfillmentResponse() {
        let responses = this.responses_;
        let followupEventInput = this.followUpEvent_;
        let outputContexts = [];

        for (let key of Object.keys(this.outputContexts_)) {
            outputContexts.push(this.outputContexts_[key])
        }

        let fulfillmentResponse = {};
        if (responses && responses.length > 0) {
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

    newOption(text, event) {
        return new Option(text, event)
    }

    buildContextName(name) {
        return `${this.session_}/contexts/${name}`
    }

    extractNameFromContextIdentificaiton(contextId) {
        return contextId.split('/').slice(-1)[0];
    }


}

class Option {
    constructor(text, event) {
        this.followUpEvent = event;
        this.text = text;
    }
}

module.exports = {
    DialogflowFulfillmentHandler
};