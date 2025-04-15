sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Core"
], (Controller, JSONModel, Core) => {
    "use strict";

    return Controller.extend("devgeonosis.controller.BaseController", {
        onInit: function () {
        },
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getOwnerComponent().setModel(oModel, sName);
        },
        onTheme: function(oEvent) {
            if(oEvent.getSource().data("Tema") == "L"){
                Core.applyTheme("sap_horizon");
                localStorage.setItem("Tema", "sap_horizon");
            }else{
                Core.applyTheme("sap_horizon_dark");
                localStorage.setItem("Tema", "sap_horizon_dark");
            }
        },
        onAddToFavorite: function (oEvent) {
            let oProduct = oEvent.getSource().getBindingContext("ModelProductsOnly").getObject();
            let oModel = this.getModel("productsModel");
            let aFavorite = oModel.getProperty("/favorite");

            let oExisting = aFavorite.find(item => item.id === oProduct.id);
            if (oExisting) {
                MessageToast.show("Este producto ya esta en favoritos");
            } else {
                aFavorite.push({ ...oProduct });
            }

            oModel.setProperty("/favorite", aFavorite);
            oModel.refresh();
            MessageToast.show("Producto agregado a lista de favoritos c:");
        }
    });
});