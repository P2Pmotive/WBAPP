const cds = require("@sap/cds");
const xsenv = require("@sap/xsenv");
const debug = require('debug')('srv:server');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const httpClient = require('@sap-cloud-sdk/http-client');
xsenv.loadEnv();

async function getCFInfo(appname) {
    try {
        // get app GUID
        let res1 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
            method: 'GET',
            url: '/v3/apps?organization_guids=' + appEnv.app.organization_id + '&space_guids=' + appEnv.app.space_id + '&names=' + appname
        });
        // get domain GUID
        let res2 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
            method: 'GET',
            url: '/v3/domains?names=' + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[1]
        });
        let results = {
            'app_id': res1.data.resources[0].guid,
            'domain_id': res2.data.resources[0].guid
        };
        return results;
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

async function createRoute(subscribedSubdomain, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // create route
                let res1 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
                    method: 'POST',
                    url: '/v3/routes',
                    data: {
                        'host': subscribedSubdomain + '-' + process.env.APP_URI.split('.')[0],
                        'relationships': {
                            'space': {
                                'data': {
                                    'guid': appEnv.app.space_id
                                }
                            },
                            'domain': {
                                'data': {
                                    'guid': CFInfo.domain_id
                                }
                            }
                        }
                    },
                });
                // map route to app
                let res2 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
                    method: 'POST',
                    url: '/v3/routes/' + res1.data.guid + '/destinations',
                    data: {
                        'destinations': [{
                            'app': {
                                'guid': CFInfo.app_id
                            }
                        }]
                    },
                });
                console.log('Route created for ' + subscribedSubdomain);
                return res2.data;
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        },
        function (err) {
            console.log(err.stack);
            return err.message;
        });
};

async function deleteRoute(subscribedSubdomain, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // get route id
                let res1 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
                    method: 'GET',
                    url: '/v3/apps/' + CFInfo.app_id + '/routes?hosts=' + subscribedSubdomain + '-' + process.env.APP_URI.split('.')[0]
                });
                if (res1.data.pagination.total_results === 1) {
                    try {
                        // delete route
                        let res2 = await httpClient.executeHttpRequest({ destinationName: 'app1-cfapi'}, {
                            method: 'DELETE',
                            url: '/v3/routes/' + res1.data.resources[0].guid
                        });
                        console.log('Route deleted for ' + subscribedSubdomain);
                        return res2.data;
                    } catch (err) {
                        console.log(err.stack);
                        return err.message;
                    }
                } else {
                    let errmsg = { 'error': 'Route not found' };
                    console.log(errmsg);
                    return errmsg;
                }
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        },
        function (err) {
            console.log(err.stack);
            return err.message;
        });
};

module.exports = (service) => {
    service.on("UPDATE", "tenant", async (req, next) => {
        console.log("Subscription data:", JSON.stringify(req.data));
        let tenantURL = process.env.APP_PROTOCOL + "://" + req.data.subscribedSubdomain + "-" + process.env.APP_URI;
        //let tenantURL = process.env.APP_PROTOCOL + "://" + req.data.subscribedSubdomain +"-dev.cfapps.us10.hana.ondemand.com";
        await next();
        const services = xsenv.getServices({
            registry: { label: 'saas-registry' }
        });
        createRoute(req.data.subscribedSubdomain, services.registry.appName + '-app').then(
            function (res2) {
                return tenantURL;
            },
            function (err) {
                debug(err.stack);
                return '';
            });
        return tenantURL;
    });

    service.on("DELETE", "tenant", async (req, next) => {
        console.log("Unsubscribe Data: ", JSON.stringify(req.data));
        await next();
        const services = xsenv.getServices({
            registry: { label: 'saas-registry' }
        });
        deleteRoute(req.data.subscribedSubdomain, services.registry.appName + '-app').then(
            async function (res2) {
                return req.data.subscribedTenantId;
            },
            function (err) {
                debug(err.stack);
                return '';
            });
        return req.data.subscribedTenantId;
    });

    service.on("upgradeTenant", async (req, next) => {
        await next();
        console.log("UpgradeTenant: ", JSON.stringify(req.data));
        console.log("UpgradeTenant: ", JSON.stringify(cds.context.req.body));
    });

    service.on("dependencies", async (req, next) => {
        let dependencies = await next();
        const services = xsenv.getServices({ destination: { tag: "destination" } });
        dependencies.push({ xsappname: services.destination.xsappname });
        console.log("SaaS Dependencies:", JSON.stringify(dependencies));
        return dependencies;
    });
};