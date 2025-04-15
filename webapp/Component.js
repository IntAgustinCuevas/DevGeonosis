sap.ui.define([
    "sap/ui/core/UIComponent",
    "devgeonosis/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("devgeonosis.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            /* OBTENGO MODELO DE PRODUCTOS DESDE EL COMPONENTE PRINCIPAL */
            const oModel = this.getModel("productsModel");

            /* CREA UN MODELO JSON QUE CONTIENE UNICAMENTE LOS PRODUCTOS */
            if (oModel) {
                oModel.attachRequestCompleted(() => {
                    const oData = oModel.getData();
                    const aProducts = [];

                    oData.catalog.categories.forEach((category) => {
                        category.subcategories.forEach((subcategory) => {
                            subcategory.products.forEach((product) => {
                                aProducts.push(product);
                            });
                        });
                    });
                    /* SETEO EL NUEVO MODELO SOLO CON PRODUCTOS AL COMPONENTE PRINCIPAL */
                    const oModelProductsOnly = new JSONModel(aProducts);
                    this.setModel(oModelProductsOnly, "ModelProductsOnly");
                })
                /* INICIALIZA TOTAL DEL CARRITO */
                if (!oModel.getProperty("/totalCart")) {
                    oModel.setProperty("/totalCart", "0.00");
                }
                /* CREA UN MODELO PARA ACTIVAR Y DESACTIVAR EL CATALOGO */
                const oStateModel = new JSONModel({
                    catalogSelectionEnabled: true
                });
                this.setModel(oStateModel, "estado");

            } else {
                console.error("El modelo 'productsModel' no está disponible.");
            }
        }
    });
});