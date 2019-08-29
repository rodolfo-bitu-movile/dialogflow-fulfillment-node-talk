'use strict';

function restaurantMenu(agent) {
    agent.copyResponsesFromDialogflow();

    agent.addOptions(
        [
            agent.newOption('Menu de café da manhã', 'service-menucafe'),
            agent.newOption('Menu de almoço', 'service-menualmoco'),
            agent.newOption('Carta de vinhos', 'service-menuvinhos')
        ]
    )
}

function defaultIntent(agent) {
    agent.addText(['Me perdi, perdão'])
}

const handler = {
    'service-comecar pedido': restaurantMenu
};


module.exports = {
    handleIntent: (agent) => {
        const intent = agent.getIntent();
        if (intent in handler) {
            handler[intent](agent)
        } else {
            defaultIntent(agent)
        }
    }
};