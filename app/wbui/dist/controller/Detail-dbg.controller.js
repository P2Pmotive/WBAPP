sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, mobileLibrary,MessageToast) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("wbui.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");
            this.oDataModel = this.getOwnerComponent().getModel();

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

            var oDataGrossWeightModel = new JSONModel();
            this.setModel(oDataGrossWeightModel, "oDataGrossWeightModel");

            var detailModel = new JSONModel();
            detailModel.setDefaultBindingMode('TwoWay');
            this.getView().setModel(detailModel, "detailModel")

            /*System Date & Time Display */
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            var hour = today.getHours();
            var Minutes = today.getMinutes();
            var Seconds = today.getSeconds();
            var today1 = ( dd+'.'+mm+'.'+yyyy+' '+hour+':'+Minutes+':'+Seconds);
            // this.getView().byId("sys_date").setText(today1.valueOf(Text));

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onSendEmailPress: function () {
            var oViewModel = this.getModel("detailView");

            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },
        handleSaveWeight: function(oEvent){
            var oModel=this.getOwnerComponent().getModel();
            var oView=this.getView();
            var that=this;
            function fnSuccess() {
                console.log("Successfully saved Weight Details");  
                that._updateCloudTable(mParameters.urlParameters);
                MessageToast.show("Successfully saved Weight Details");            
                };               
                function fnError() {  
                that._updateCloudTable(mParameters.urlParameters,"X");             
                console.log("Failed to sent to backend")               
                };
                
                var mParameters = {                
                method: "POST",               
                urlParameters: {              
                "PurchaseOrder" : oView.byId("semPageTitle").getText(),              
                "VehicalNo" : oView.byId("idVehicle").getValue(),
                "GrossWeight":oView.byId("idGW").getText().replace(/[^\d\.\-]/g, ""),
                "TareWeight":oView.byId("idTW").getText().replace(/[^\d\.\-]/g, ""),
                "UnitOfMeasure":oView.byId("idU").getText()            
                },               
                context: null,               
                success: fnSuccess,               
                error: fnError,              
                async: true };
                
                oModel.callFunction("/Zcustompo", mParameters);

        },

        _updateCloudTable:function(WObj,eFlag){
            var oView=this.getView();
            var oDataModel = this.getOwnerComponent().getModel("hanaModel");
           var wLObj={
            "PoNo":WObj.PurchaseOrder,
            "vehical_No":WObj.VehicalNo,
            "error_status":eFlag===undefined?"":eFlag,
            "Gross_weight":WObj.GrossWeight,
            "Tare_weight":WObj.TareWeight,
            "Net_weight":oView.byId("idNW").getText().replace(/[^\d\.\-]/g, ""),
            "Uom":WObj.UnitOfMeasure
           };

           oDataModel.create("/offSyncWeightDetails",wLObj,null,function(){
            console.log("successfully updated the cloud table");
           },function(){
            console.log("Failed to update the cloud table");
           });
        },

        handleTareWt: function(oEvent){
            var dataresults;
            var oDataModel = this.getOwnerComponent().getModel("hanaModel");
            var oFilter=new sap.ui.model.Filter({
                path: "gate",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: "OUT"
            });
            // this.LineItemindex = oEvent.getSource().getParent().getBindingContextPath().split("/")[3];
            // this.index = parseInt(this.LineItemindex);
            oDataModel.read("/GTWeightDetails", {
                filters:[oFilter],
                success: function (oData, response) {
                    var data = oData.results;
                    var weight = data[0].weight;
                    var weig=this.formatter.onFormatNumber(weight);
                    this.getView().byId("idTW").setText(weig);
                    //this.getView().getModel("detailModel").getData().Items.results[this.index].Tareweight = weight;
                    // this.getView().getModel("detailModel").getData()[this.index].Tareweight = weight;
                    // this.getView().getModel("detailModel").getData().Items.results[this.index]
               
                    this.calculateNetWeight();
                    this.getView().getModel("detailModel").refresh();
                }.bind(this),
                error: jQuery.proxy(function (oError) {
                    alert('Try Again');

                })
            });
        },

        handleGrossWt: function (oEvent) {
            var dataresults;
            var oDataModel = this.getOwnerComponent().getModel("hanaModel");
            var oFilter=new sap.ui.model.Filter({
                path: "gate",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: "IN"
            });
            // this.LineItemindex = oEvent.getSource().getParent().getBindingContextPath().split("/")[3];
            // this.index = parseFloat(this.LineItemindex);
           // this.grossweight = this.getView().getModel("detailModel").getData()[this.ind].Grossweight;
            oDataModel.read("/GTWeightDetails", {
                filters:[oFilter],
                success: function (oData, response) {
                    var data = oData.results;
                    var weight = data[0].weight;
                    // var that = this;
                    //this.getView().getModel("detailModel").getData().Items.results[this.index].Grossweight = weight;
                    var weig=this.formatter.onFormatNumber(weight);
                      this.getView().byId("idGW").setText(weig);
                    var uom = data[0].uom; 
                    this.getView().byId("idU").setText(uom);                   
                    // this.getView().getModel("detailModel").getData().Items.results[this.index].Unitofmeasure = uom;

                    this.calculateNetWeight();
                    this.getView().getModel("detailModel").refresh();

                }.bind(this),
                error: jQuery.proxy(function (oError) {
                    alert('Try Again');

                })
            });

        },
        calculateNetWeight: function (oEvent) {
            // var local_GWt = this.getView().getModel("detailModel").getData()[this.index].Grossweight;
            var local_GWt = parseFloat(this.getView().byId("idGW").getText().replace(/[^\d\.\-]/g, ""));
            var local_TWt = parseFloat(this.getView().byId("idTW").getText().replace(/[^\d\.\-]/g, ""));
            // var local_TWt = this.getView().getModel("detailModel").getData()[this.index].Tareweight;
           if(local_GWt > 0 && local_TWt > 0){
                var local_NetWt = Math.abs(local_GWt - local_TWt);
                var local_NetWtg=this.formatter.onFormatNumber(local_NetWt);
                this.getView().byId("idNW").setText(local_NetWtg);
                this.getView().byId("idWD").setEnabled(true);
                // this.getView().getModel("detailModel").getData().Items.results[this.index].Net
           }
        },


        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */
        onListUpdateFinished: function (oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            sObjectId = sObjectId.replace(":", "%3A");
            var sPath = "/POHeaders('" + sObjectId + "')";
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getModel().metadataLoaded().then(function () {
                this.oDataModel.read(sPath, {
                    urlParameters: {
                        "$expand": ["Items"]
                    },
                    success: function (oData, oResponse) {
                        var data = oData.Items.results
                        this.getView().getModel('detailModel').setData(oData);
                        this.getView().getModel("detailView").setProperty("/busy", false);
                    }.bind(this),
                    error: function (a, b, c) {
                        this.getView().getModel("detailView").setProperty("/busy", false);
                    }.bind(this)
                });
                // var sObjectPath = this.getModel().createKey("POHeaders", {
                //     Id:  sObjectId 
                // });
                // this._bindView("/" + sObjectPath );
            }.bind(this));


        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearListListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.Id,
                sObjectName = oObject.PurchaseOrder,
                oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("lineItemsList"),
                iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

            oLineItemTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for line item table
                oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            });

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /**
         * Set the full screen mode to false and navigate to list page
         */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on list after detail page is closed
            this.getOwnerComponent().oListSelector.clearListListSelection();
            this.getRouter().navTo("list");
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
            }
        }
    });
});