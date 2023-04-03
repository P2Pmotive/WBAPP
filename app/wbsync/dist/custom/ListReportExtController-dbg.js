sap.ui.define([],
    function () {
        "use strict";
        return {
            onSyncPress: function (oEvent) {
                var sContexts = this.getSelectedContexts();
                //var entities = [];            
                    for (let index = 0; index < sContexts.length; index++) {
                        var oPObj = sContexts[index].getObject();
                        var uObj={
                                    "PurchaseOrder": oPObj.PoNo,
                                    "VehicalNo": oPObj.vehical_No,
                                    "GrossWeight":oPObj.Gross_weight,
                                    "TareWeight": oPObj.Tare_weight,
                                    "UnitOfMeasure":oPObj.Uom
                                };
                
                    var oModel=this.getModel("oHanaService");
                    function fnSuccess() {
                        console.log("Successfully saved Weight Details");
                        //that._updateCloudTable(mParameters.urlParameters);
                        MessageToast.show("Successfully saved Weight Details");
                    };
                    function fnError(oError) {
                        MessageToast.show("Failed to update Weight Details");
                    };

                    var mParameters = {
                        method: "POST",
                        urlParameters: uObj,
                        context: null,
                        success: fnSuccess,
                        error: fnError,
                        async: true
                    };

                    oModel.callFunction("/Zcustompo", mParameters);
                }
                
            }
        };
    });
