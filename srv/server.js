const cds=require('@sap/cds');

const proxy= require('@sap/cds-odata-v2-adapter-proxy');

cds.on("served", async () => {
    const { "cds.xt.SaasProvisioningService": provisioning } = cds.services;
    let tenantProvisioning = require("./provisioning");
    provisioning.prepend(tenantProvisioning);
});

cds.on('bootstrap',app => {

    app.use(proxy());

});



module.exports=cds.server;