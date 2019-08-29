
const generalConfigs = require(path.resolve(__dirname, 'config/config.json'));
const stage = process.env['STAGE'];
const configs = generalConfigs[stage];
if (!configs) {
    console.error(`Lambda initialization failed. Invalid STAGE=${stage}`);
    process.exit(1);
}

const { DialogflowUtil } = require('./lib');

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



    } catch (e) {
        console.log(e);
    }
}

            if (isNaN(USER_PHONE)) {
                USER_PHONE = '00';
            }

            console.log(`User phone: ${USER_PHONE}`);

            let intent = body.queryResult.intent.displayName;
            if (intent) {
                console.log(`processing intent: ${intent}`);
                if (registryRequiredIntents.includes(intent) && !getRegistry(body.queryResult)) {
                    console.log(`intent ${intent} requires registry. Redirecting to generic_ask_registry`);
                    DialogflowUtil.attachApisOutputContext(outputContext, 'generic_ask_registry', body.session, sessionParameters);
                    sessionParameters.redirect = intent;
                    DialogflowUtil.outputContextLifespan(outputContext, 'on_registry_redirect', body.session, sessionParameters, 6);
                    DialogflowUtil.attachTextToFinalResponse(finalResponse, ['Para verificar isso, preciso do seu número de registro cadastral. Pode me passar, por favor?']);
                    done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));
                    return;
                }
                if (intent === 'generic_ask_registry') {
                    let [redirectCtx] = body.queryResult.outputContexts.filter(ctx => ctx.name.endsWith('on_registry_redirect'));
                    if (redirectCtx && redirectCtx.parameters) {
                        intent = redirectCtx.parameters.redirect;
                        DialogflowUtil.deleteContext(outputContext, 'generic_ask_registry', body.session, {});
                        DialogflowUtil.deleteContext(outputContext, 'on_registry_redirect', body.session, {});
                        let registryParameter = { registry: getRegistry(body.queryResult) };
                        DialogflowUtil.outputContextLifespan(outputContext, '_registry_holder', body.session, registryParameter, 999);
                        console.log(`redirecting to intent ${intent}`);
                    }
                }
                switch (intent) {
                    case '000_test_action_acompanhento_pontos': // Raphael

                        params = DialogflowUtil.getParametersFromContext(body.queryResult);

                        if (params && params.registry && params.registry !== "") { // If has already gotten revendor's ID

                            let pointsInfo = await RestUtil.getPoints(params.registry, configs);
                            console.log(`pointsInfo ${JSON.stringify(pointsInfo, null, 2)}`);

                            if (pointsInfo && pointsInfo.Valor) {
                                msg = `[TW] Você tem ${pointsInfo.Valor} pontos.`;
                            } else {
                                msg = `[TW] Não foi possível acessar seus pontos no momento. Você pode tentar mais tarde?  Ou você também pode acompanhar a evolução dos seus pontos no site da Avon, basta clicar na opção "Incentivos" e depois em "Meu Mundo Avon".\n\nIr para o site: www.avon.com.br`;
                            }


                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                        } else { // If hasn't gotten revendor's ID
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }

                        break;

                    case 'HSM1_hsm_exit':

                        telefone = USER_PHONE;
                        user_data = idExistente_POC (USER_PHONE);

                        if (user_data.Items.length === 0) { // pessoa não está no BD
                            msg = `Retornando você para o atendimento normal. @@TRANSFER@@`
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                            break;
                        }
                        if (!isUserInPF(user_data.Items[0].disparo)) {
                            msg = `Tudo bem! Você será retornado ao atendimento normal. @@TRANSFER@@`
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                            break;
                        }


                        registro = user_data.Items[0].registro;
                        telefone = user_data.Items[0].telefone;
                        ano = user_data.Items[0].ano;
                        cpf = user_data.Items[0].cpf;
                        cod_kit = user_data.Items[0].cod_kit;
                        campanha = user_data.Items[0].campanha;
                        nome = user_data.Items[0].nome;
                        disparo = user_data.Items[0].disparo;

                        RestUtil.postBanco(registro, telefone, ano, cpf, cod_kit, campanha, nome, "não", "null", "null", disparo);

                        break;


                    case 'HSM1_hsm_agree':

                        telefone = USER_PHONE;                        
                        user_data = idExistente_POC (USER_PHONE);

                        console.log(`USER DATA: ${JSON.stringify(user_data)}`);

                        if (user_data.Items.length === 0) { // pessoa não está no BD
                            msg = `Ops, preciso retornar você para o atendimento normal. @@TRANSFER@@`
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                            break;
                        }

                        if (!isUserInPF(user_data.Items[0].disparo)) {
                            msg = `Ops, seu tempo para aceitar a oferta terminou. Ah, mas deixa eu te dar uma superdica: você pode enviar o seu Pedido a qualquer momento. É só acessar site Avon Comigo e aproveitar as novidades e ofertas exclusivas da Campanha para lucrar muito!. @@TRANSFER@@`
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                            break;
                        }


                        cpf = user_data.cpf;
                        telefone = user_data.telefone;
                        birthyear = user_data.ano;

                        sessionParameters.true_user_cpf = 222;
                        sessionParameters.true_user_phone = 1243;
                        sessionParameters.true_user_birthyear = 9999;
                        DialogflowUtil.attachApisOutputContext(outputContext, 'got_user_data', body.session, sessionParameters);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, outputContext, undefined));

                        break;


                    case 'HSM1_hsm_agree_GET_qnt':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        var qnt = params.qnt;
                        sessionParameters.qnt_kits = qnt;

                        telefone = USER_PHONE;
                        user_data = idExistente_POC (USER_PHONE);

                        registro = user_data.Items[0].registro;
                        telefone = user_data.Items[0].telefone;
                        ano = user_data.Items[0].ano;
                        cpf = user_data.Items[0].cpf;
                        cod_kit = user_data.Items[0].cod_kit;
                        campanha = user_data.Items[0].campanha;
                        nome = user_data.Items[0].nome;
                        disparo = user_data.Items[0].disparo;


                        RestUtil.postBanco(registro, telefone, ano, cpf, cod_kit, campanha, nome, "null", "null", qnt.toString(), disparo);

                        if (qnt > 9999 || qnt < 1) {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_hsm_agree_FB2', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));

                        } else if (qnt >= 10) {
                            msg = `Você solicitou ${qnt} kits. Se a quantidade estiver correta, envie a palavra "sim" para confirmar.`;
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                            sessionParameters.qnt_kits = qnt;
                            DialogflowUtil.outputContextLifespan(outputContext, 'HSM1_chose_many-followup', body.session, sessionParameters, 1);
                            DialogflowUtil.attachApisOutputContext(outputContext, 'got_qnt_kits', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_check_cpf', undefined);
                            DialogflowUtil.attachApisOutputContext(outputContext, 'got_qnt_kits', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, outputContext, followUpEvent));
                        }
                        break;


                    case 'HSM1_chose_many_YES':

                        followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_check_cpf', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'HSM1_chose_many_NO':
                        DialogflowUtil.outputContextLifespan(outputContext, 'HSM1_chose_many-followup', body.session, sessionParameters, 1);
                        followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_hsm_agree_REPEAT', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'HSM1_check_cpf_GET':

                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        let informed_cpf = params.cpf;

                        telefone = USER_PHONE;
                        user_data = idExistente_POC (USER_PHONE);
                        let true_cpf = user_data.Items[0].cpf;

                        if (informed_cpf !== true_cpf) {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_check_cpf_FB', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_check_birthyear', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;

                    case 'HSM1_check_birthyear_GET':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        let informed_year = params.year;
                        telefone = USER_PHONE;
                        user_data = idExistente_POC (USER_PHONE);
                        let true_year = user_data.Items[0].ano;

                        if (informed_year !== true_year) {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_check_birthyear_FB', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        } else {

                            followUpEvent = DialogflowUtil.createFollowUpEvent('HSM1_done', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));

                        }

                        break;

                    case 'HSM1_done':
                        telefone = USER_PHONE;
                        user_data = idExistente_POC (USER_PHONE);

                        registro = user_data.Items[0].registro;
                        telefone = user_data.Items[0].telefone;
                        ano = user_data.Items[0].ano;
                        cpf = user_data.Items[0].cpf;
                        cod_kit = user_data.Items[0].cod_kit;
                        campanha = user_data.Items[0].campanha;
                        nome = user_data.Items[0].nome;
                        let hora_aceite = RetornaDataHoraFinal();
                        let quantidade = user_data.Items[0].quantidade;
                        disparo = user_data.Items[0].disparo;


                        RestUtil.postBanco(registro, telefone, ano, cpf, cod_kit, campanha, nome, "sim", hora_aceite, quantidade, disparo);

                        msg = `Pronto! O Pedido foi aprovado e você receberá no seu endereço de entrega!\n\nSe mudar de ideia e decidir cancelar a compra, é só acessar o nosso site - www.avon.com.br – informar o seu registro cadastral e senha para excluir o Pedido.\n\nAh, mas antes de terminar deixa eu te dar uma superdica: acesse o site Avon Comigo – www.avon.com.br -  e aproveite as novidades e ofertas exclusivas da Campanha para lucrar ainda mais!Te desejo ótimas vendas!\n\nMuito obrigada e até a próxima! ☺️@@TRANSFER@@`;
                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));

                        break;

                    case "attendance_survey":

                        get_id = await idExistente(USER_PHONE);

                        if (get_id && get_id !== ""){

                            lastId = get_id.events[0].id;
                            nome = get_id.events[0].name;
                            let end_date = new Date().toISOString();

                            await RestUtil.putRDSClient_end_date(lastId, end_date, configs);
                        }

                        msg_1 = body.queryResult.fulfillmentMessages[0].text.text[0];
                        msg_2 = body.queryResult.fulfillmentMessages[1].text.text[0];

                        if (nome && nome && nome !== "") {
                            msg_1 = msg_1.replace("++nome++", nome);
                        }
                        else {
                            msg_1 = msg_1.replace("++nome++", "");
                        }

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg_1]);
                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg_2]);

                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));

                        break;

                    case "attendance_survey_1_otima":
                    case "attendance_survey_2_boa":
                    case "attendance_survey_3_ruim":

                        if (body.queryResult.intent.displayName === "attendance_survey_1_otima") {
                            answer = 1;
                        }

                        else if (body.queryResult.intent.displayName === "attendance_survey_2_boa") {
                            answer = 2;
                        }
                        else if (body.queryResult.intent.displayName === "attendance_survey_3_ruim") {
                            answer = 3;
                        }

                        let raw_answer = body.queryResult.queryText;

                        get_id = await idExistente(USER_PHONE);

                        lastId = get_id.events[0].id;

                        let answer_date = new Date().toISOString();
                        await RestUtil.putRDSClient_answer_date(lastId, answer, answer_date, raw_answer, configs);

                        followUpEvent = DialogflowUtil.createFollowUpEvent('attendance_survey_end', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));

                        break;


                    case 'action_acompanhento_pontos': 

                        params = DialogflowUtil.getParametersFromContext(body.queryResult);

                        if (params && params.registry && params.registry !== "") { // If has already gotten revendor's ID

                            msg = `Ainda estou me preparando para conseguir passar essa informação para você por aqui! Enquanto isso, você pode consultar seus pontos no site da Avon: www.avon.com.br`;


                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                        } else { // If hasn't gotten revendor's ID
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }

                        break;
                    
                    case 'saldo_disponivel':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            let credit_info = await RestUtil.getCreditLimit(params.registry, configs);
                            let available_balance = credit_info.campaignOrderValue;
                            msg_1 = `Posso ver isso agora!`;
                            msg_2 = `Seu saldo disponível para enviar Pedidos é de R$ ${available_balance.replace('.', ',')}. Aproveite!`;
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg_1]);
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg_2]);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                        
                        } else { 
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;

                    case 'action_campaign_date':

                        RA = getRegistry(body.queryResult);

                        getRepresentative_result = await RestUtil.getRepresentative(RA, configs);

                        cmpgnYr = getRepresentative_result.currentCampaignYear;
                        cmpgnNr = getRepresentative_result.currentCampaignNumber;

                        getCampaignDate_result = await RestUtil.getCampaignDate(cmpgnYr, cmpgnNr, RA, configs);

                        campaignDateStart = getCampaignDate_result.data.dates[0].dateDateStart;

                        campaignDateEnd = getCampaignDate_result.data.dates[0].dateDateEnd;

                        campaignDateStart = moment(campaignDateStart).format('DD/MM/YYYY');
                        campaignDateEnd = moment(campaignDateEnd).format('DD/MM/YYYY');

                        msg = `Eu consigo ver isso agora mesmo!\n\nVocê está na campanha ${cmpgnNr} e o seu período de vendas é ${campaignDateStart} até ${campaignDateEnd}!`;

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));

                        break;

                    case 'action_billing_date':

                        RA = getRegistry(body.queryResult);

                        getRepresentative_result = await RestUtil.getRepresentative(RA, configs);

                        cmpgnYr = getRepresentative_result.currentCampaignYear;
                        cmpgnNr = getRepresentative_result.currentCampaignNumber;

                        getCampaignDate_result = await RestUtil.getCampaignDate(cmpgnYr, cmpgnNr, RA, configs);

                        campaignDateEnd = getCampaignDate_result.data.dates[1].dateDateEnd;

                        campaignDateEnd = moment(campaignDateEnd).format('DD/MM/YYYY');

                        msg = `Ok, já te digo a data de faturamento!\n\nSeu Pedido da campanha ${cmpgnNr} será faturado em ${campaignDateEnd}!`;

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));

                        break;

                    case 'action_site_closure':

                        RA = getRegistry(body.queryResult);

                        getRepresentative_result = await RestUtil.getRepresentative(RA, configs);

                        cmpgnYr = getRepresentative_result.currentCampaignYear;
                        cmpgnNr = getRepresentative_result.currentCampaignNumber;

                        getCampaignDate_result = await RestUtil.getCampaignDate(cmpgnYr, cmpgnNr, RA, configs);

                        campaignDateStart = getCampaignDate_result.data.dates[0].dateDateStart;

                        campaignDateEnd = getCampaignDate_result.data.dates[0].dateDateEnd;

                        campaignDateStart = moment(campaignDateStart).format('DD');
                        campaignDateEnd = moment(campaignDateEnd).format('DD/MM/YYYY');

                        msg = `Eu verifico isso já!\n\nVocê pode enviar Pedidos de ${campaignDateStart} até ${campaignDateEnd}!`;

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));

                        break;

                    case 'action_cumprimentos_iniciais':
                        sessionParameters = {
                            registry: body.queryResult.parameters.registry,
                            dateTime: Date.now()
                        };
                        followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido', sessionParameters);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'action_webservice_pedido_request_registry':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            [revendorTypeInfo, representative] =
                                await Promise.all(
                                    [
                                        RestUtil.getRevendorType(params.registry, configs),
                                        RestUtil.getRepresentative(params.registry, configs)
                                    ]
                                );
                            if (revendorTypeInfo.status === 2) {
                                followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_wrong_registry', undefined);
                                done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                            } else {
                                let registryParameter = { registry: params.registry };
                                DialogflowUtil.outputContextLifespan(outputContext, '_registry_holder', body.session, registryParameter, 999);
                                await Processor.processRevendorTypeInfo(finalResponse, outputContext, body.session, revendorTypeInfo, representative);
                                done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));
                            }
                        }
                        break;

                    case 'action_onde_encontro_meu_registro':

                        msg = `Vou te ajudar nisso!\n\nO registro cadastral é o seu código de identificação na Avon como Revendedora e ele é composto por oito números.\n\nVocê pode localizar o seu registro no boleto bancário da Avon, ao lado do seu nome ou na parte superior da nota fiscal do Pedido. \n\nAgora que você já sabe, é só enviar o seu registro pra gente continuar a conversa. 😉`;
                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        if (!hasActiveContext(body.queryResult, 'attendance_available-yes-followup'))
                            DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido_request_registry', body.session, sessionParameters);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));

                        break;

                    case 'action_cpf_rg':

                        msg = `Ainda não consigo identificar você pelo CPF ou por outro documento 😢.  \nDeixa eu te explicar como localizar o seu registro cadastral: pode ser no boleto bancário da Avon, logo abaixo do seu nome, ou na parte superior da nota fiscal do Pedido. \nAgora que você já sabe, é só enviar o registro cadastral pra gente continuar com o atendimento.`;
                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido_request_registry', body.session, sessionParameters);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));

                        break;

                    case 'action_webservice_pedido':
                    case 'action_webservice_pedido-TO-action_webservice_pedido':
                    case 'action_webservice_pedido_wrong_registry':
                    case 'pergunta_pode_ajudar_algo_mais - yes':

                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            [revendorTypeInfo, representative] =
                                await Promise.all(
                                    [
                                        RestUtil.getRevendorType(params.registry, configs),
                                        RestUtil.getRepresentative(params.registry, configs)
                                    ]
                                );
                            if (revendorTypeInfo.status === 2) {
                                followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_wrong_registry', undefined);
                                done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                            } else {
                                await Processor.processRevendorTypeInfo(finalResponse, outputContext, body.session, revendorTypeInfo, representative);
                                done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));
                            }
                        } else {
                            msg = `Digite o *número do seu registro cadastral* na Avon para conhecer as opções de consulta.`;
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                            DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido_request_registry', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext, undefined));
                        }
                        break;

                    case 'action_webservice_pedido-api_processor_intent':
                        let option = body.queryResult.queryText;
                        option--;
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        let intentName = params.options[option];
                        console.log(`User option: ${option + 1}. Looking in array: ${option}. Intent name ${intentName}`);
                        if (!intentName) {
                            intentName = 'action_webservice_pedido';
                        }
                        sessionParameters = {};
                        if (intentName !== 'action_webservice_pedido_request_registry') {
                            sessionParameters = {
                                registry: params.registry,
                                revendorName: params.revendorName,
                                dateTime: Date.now()
                            };
                        }
                        followUpEvent = DialogflowUtil.createFollowUpEvent(intentName, sessionParameters);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));

                        break;
                    case 'action_consulta_ultimo_pedido':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            revendorName = await RestUtil.getRevendorName(params.registry, configs);
                            let lastOrderInfo = await RestUtil.getLastOrderInfo(params.registry, configs);
                            await Processor.processLastOrder(finalResponse, lastOrderInfo, revendorName);
                            sessionParameters = await Processor.processSessionParameters(params.registry, params.revendorName);

                            DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;
                    case 'action_consulta_proxima_entrega':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            let nextDeliveryInfo = await RestUtil.getNextDeliveryInfo(params.registry, configs);
                            await Processor.processNextDeliveryInfo(finalResponse, nextDeliveryInfo);
                            sessionParameters = await Processor.processSessionParameters(params.registry, params.revendorName);

                            DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;
                    case 'action_consulta_ultima_entrega':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (params && params.registry && params.registry !== "") {
                            let lastDeliveryInfo = await RestUtil.getLastDeliveryInfo(params.registry, configs);
                            await Processor.processLastDeliveryInfo(finalResponse, lastDeliveryInfo);
                            sessionParameters = await Processor.processSessionParameters(params.registry, params.revendorName);

                            DialogflowUtil.attachApisOutputContext(outputContext, 'action_webservice_pedido', body.session, sessionParameters);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;
                    case 'action_segunda_via_boleto':
                        if (isNowBetween('03/08/2019 12:00:00', '04/08/2019 12:00:00')) { // Scheduled message for service down
                            msg = MSG_SERVICE_DOWN_170803;
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                            break;
                        }
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        if (!representative && params && params.registry && params.registry !== "") {
                            representative = await RestUtil.getRepresentative(params.registry, configs);
                        }
                        if (representative) {
                            let revendorType = representative.accountType;
                            let revendorName = representative.firstName;
                            let accountStatusCD = representative.accountStatusCD;
                            let accountStatusDesc = representative.accountStatusDesc;
                            let pendingTicketsInfo = await RestUtil.getPendingTicketsInformation(params.registry, revendorName, revendorType, configs);

                            console.log(`pendingTicketsInfo ${JSON.stringify(pendingTicketsInfo)}`);
                            let isAttendanceAvailable = shouldAllowAttendance(USER_PHONE);
                            sessionParameters = await Processor.processSessionParameters(params.registry, params.revendorName);
                            await Processor.processPendingTicketsInfo(finalResponse, pendingTicketsInfo, revendorName, source, isAttendanceAvailable, body.session, outputContext, accountStatusCD, accountStatusDesc, sessionParameters);

                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        } else {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        }
                        break;

                    case 'action_memes_campanha_continuar':
                        followUpEvent = DialogflowUtil.createFollowUpEvent('menu_memes', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'action_opcoes_parcelamento_avon':
                        attendanceEvent = shouldAllowAttendance(USER_PHONE) ? 'attendance_available' : 'attendance_not_available';
                        followUpEvent = DialogflowUtil.createFollowUpEvent(attendanceEvent, undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'action_transferir_para_humano':
                        attendanceEvent = shouldAllowAttendance(USER_PHONE) ? 'action_transferir_para_humano_attendance_available' : 'action_transferir_para_humano_not_available';
                        followUpEvent = DialogflowUtil.createFollowUpEvent(attendanceEvent, undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, outputContext, followUpEvent));
                        break;

                    case 'action_nao_consigo_atendimento':
                        attendanceEvent = shouldAllowAttendance(USER_PHONE) ? 'action_nao_consigo_atendimento_attendance_available' : 'action_transferir_para_humano_not_available';
                        followUpEvent = DialogflowUtil.createFollowUpEvent(attendanceEvent, undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'pergunta_pode_ajudar_algo_mais - no':
                        followUpEvent = DialogflowUtil.createFollowUpEvent('action_cumprimentos_finais', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'attendance_ask_registry_ticketsexp_no':
                        console.log('attendance_ask_registry_ticketsexp_no');
                        DialogflowUtil.deleteContext(outputContext, 'attendance_ask_registry_ticketsexp', body.session, {});
                        DialogflowUtil.attachApisOutputContext(outputContext, 'attendance_available-followup', body.session, sessionParameters);
                        followUpEvent = DialogflowUtil.createFollowUpEvent('2019', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, outputContext, followUpEvent));
                        break;

                    case 'attendance_ask_registry_ticketsexp':
                    case 'attendance_ask_registry':
                        params = DialogflowUtil.getParametersFromContext(body.queryResult);
                        console.log("Params:", params);
                        revendorTypeInfo = await RestUtil.getRevendorType(params.registry, configs);
                        if (revendorTypeInfo.status === 2) {
                            followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_wrong_registry', undefined);
                            done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        } else {
                            nome = revendorTypeInfo.resultado.nome;
                            let start_date = new Date().toISOString();

                            console.log("Telefone:" + USER_PHONE + " RA:" + params.registry + " nome:" + nome + " Data inicio:" + start_date)

                            await RestUtil.postRDSClient_create_user(USER_PHONE, params.registry, nome, start_date, configs);

                            console.log(`starting attendance for user ${USER_PHONE}`);

                            finalResponse = body.queryResult.fulfillmentMessages;
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [configs.neppoInterceptor]);
                            done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, undefined, undefined));
                        }
                        break;

                    case 'qual_meu_setor':
                        registry = getRegistry(body.queryResult);
                        representative = await RestUtil.getRepresentative(registry, configs);
                        msg = '';
                        if (representative) {
                            msg = 'Eu vejo isso agora pra você! 😉\n\n' +
                                `O seu Setor é *${representative.fieldLvlCode}*! Sempre que precisar confirmar o Setor, é só me chamar que eu te ajudo! 😊`;
                        } else {
                            msg = 'Não consegui achar o seu setor agora. Ainda estou aprendendo, pergunte mais tarde que talvez eu já tenha a resposta';
                        }

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        break;

                    case 'qual_minha_equipe':
                        registry = getRegistry(body.queryResult);
                        representative = await RestUtil.getRepresentative(registry, configs);
                        msg = '';
                        if (representative) {
                            const team = representative.teamFieldLvlCode.slice(-2);
                            msg = 'Eu vejo isso agora pra você!\n\n' +
                                `A sua Equipe é *${team}*! Sempre que precisar confirmar a Equipe, é só me chamar que eu te ajudo!`;
                        } else {
                            msg = 'Não consegui achar a sua equipe agora. Ainda estou aprendendo, pergunte mais tarde que talvez eu já tenha a resposta';
                        }

                        DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        break;

                    case 'generic_ask_registry':
                        followUpEvent = DialogflowUtil.createFollowUpEvent('action_webservice_pedido_request_registry', undefined);
                        done(false, DialogflowUtil.createFulfillmentResponse(undefined, undefined, followUpEvent));
                        break;

                    case 'limite_credito':
                        registry = getRegistry(body.queryResult);
                        const creditInfo = await RestUtil.getCreditLimit(registry, configs);
                        let message_responses = [];
                        if (creditInfo) {
                            if (creditInfo.hasCreditLimit) {
                                const creditLimit = creditInfo.totalCreditLimit.replace('.', ',');
                                message_responses = [
                                    'Eu consulto agora mesmo pra você!',
                                    `Seu limite de crédito é de *R$ ${creditLimit}*.`
                                ];
                            } else {
                                message_responses = [
                                    'Eu consulto agora mesmo!',

                                    'Você está sem limite de crédito disponível no momento, mas tem dois jeitos de enviar Pedido mesmo assim:\n' +
                                    '• Você pode escolher o cartão de crédito para pagar, e até parcelar o valor;\n' +
                                    '• Ou usar boleto pré-pago, ou seja, você gera o boleto, paga e então seu pedido é faturado.',

                                    'Espero que essas opções funcionem pra você! <3'
                                ];
                            }
                        } else {
                            message_responses = ['Não consegui achar o seu limite de crédito. Ainda estou aprendendo, pergunte mais tarde que talvez eu já tenha a resposta'];
                        }
                        for (let msg_item of message_responses)
                            DialogflowUtil.attachTextToFinalResponse(finalResponse, [msg_item]);
                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse, outputContext));
                        break;

                    default:
                        let intentInformation = await getIntentInformation(intent);
                        console.log(`intentInformation ${JSON.stringify(intentInformation)}`);

                        let client = RedisUtil.createClient({
                            host: 'discovery-redis-vpc.squwib.0001.use2.cache.amazonaws.com',
                            port: '6379'
                        });

                        let lastIntent = await RedisUtil.getLastIntent(client, body.session, configs['redis-suffix']);
                        finalResponse = [];
                        let lastIntentResponses = [];
                        if (lastIntent && lastIntent !== {}) {
                            let lastIntentInfo = await getIntentInformation(lastIntent);
                            console.log(`lastIntentInfo from cache: ${JSON.stringify(lastIntentInfo)}`);
                            let lastIntentInformation = await Processor.processIntentInfo(lastIntentInfo);
                            console.log(`lastIntentInformation; ${lastIntentInformation}`);
                            if (lastIntentInformation[0] && lastIntentInformation[0].trim() !== "") {
                                lastIntentResponses = JSON.parse(lastIntentInformation[0]);
                                finalResponse = finalResponse.concat(lastIntentResponses);
                            }
                        }

                        console.log(`intentInformation ${JSON.stringify(intentInformation)}`);
                        let intentResponses, outcontext, eventout, contextclear;
                        [intentResponses, outcontext, eventout, contextclear] = await Processor.processIntentInfo(intentInformation);
                        followUpEvent = (eventout.trim() === '') ? undefined : DialogflowUtil.createFollowUpEvent(eventout, {});
                        if (outcontext && outcontext.trim() !== '') {
                            DialogflowUtil.attachApisOutputContext(outputContext, outcontext, body.session, {})
                        }

                        if (intentResponses.trim() !== '') {
                            intentResponses = JSON.parse(intentResponses);
                            finalResponse = finalResponse.concat(intentResponses)
                        }
                        if (lastIntent && !followUpEvent) {
                            await RedisUtil.delLastIntent(client, body.session, configs['redis-suffix'])
                        }
                        if (followUpEvent) {
                            await RedisUtil.setLastIntent(client, body.session, intent, configs['redis-suffix'])
                        }

                        client.quit();

                        done(false, DialogflowUtil.createFulfillmentResponse(finalResponse,
                            (outputContext.length > 0) ? outputContext : undefined, followUpEvent));
                        break;
                }
            }
        } else {

};
