sap.ui.define([
    "devgeonosis/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Fragment"
], (BaseController, MessageToast, JSONModel, Dialog, Button, Text, Fragment) => {
    "use strict";

    return BaseController.extend("devgeonosis.controller.Detail", {
        formatter: {
            formatPrice: function(price, currency) {
                return price.toFixed(2);
            },
            
            getCardHeader: function(params) {
                return {
                    title: params.title,
                    iconSrc: params.icon
                };
            }
        },
        
        onInit: function () {
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onPatternMatched, this);

            const oModel = this.getOwnerComponent().getModel("ModelProductsOnly");
            const oModelShowNavButton = new JSONModel({
                shellbarConfig: {
                    showNavButton: true
                }
            });

            this.getView().setModel(oModelShowNavButton, oModel);           
        },

        _onPatternMatched: function (oEvent) {
            this.getModel("estado").setProperty("/catalogSelectionEnabled", false);
            let sProductPath = decodeURIComponent(oEvent.getParameter("arguments").productPath);
            this.getView().bindElement({
                path: sProductPath,
                model: "ModelProductsOnly"
            });
        },

        onHome: function() {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteDefault");
        },
        
        onBack: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteDefault");
        },
        
        onAddToCart: function (oEvent) {
            // Obtenemos el producto actual
            const oBindingContext = this.getView().getBindingContext("ModelProductsOnly");
            const oProduct = oBindingContext.getObject();
            
            // Obtenemos la cantidad seleccionada
            const iQuantity = this.byId("quantityInput").getValue();
            
            // Obtenemos la variante seleccionada si existe
            let oVariant = null;
            if (oProduct.variants && oProduct.variants.length > 0) {
                const oSelect = this.byId("variantSelect");
                if (oSelect) {
                    const sVariantId = oSelect.getSelectedKey();
                    oVariant = oProduct.variants.find(v => v.variantId === sVariantId);
                }
            }
            
            const oModel = this.getOwnerComponent().getModel("productsModel");
            const aCart = oModel.getProperty("/cart");
            
            // Si hay una variante seleccionada
            const sProductId = oVariant ? oVariant.variantId : oProduct.id;
            const fPrice = oVariant ? oVariant.price : oProduct.price;

            const oExisting = aCart.find(item => item.id === sProductId);
            if (oExisting) {
                oExisting.quantity += parseInt(iQuantity);
                oExisting.total = oExisting.quantity * oExisting.price;
            } else {
                aCart.push({
                    id: sProductId,
                    productId: oProduct.id,
                    name: oProduct.name + (oVariant ? " - " + oVariant.color : ""),
                    price: fPrice,
                    currency: oProduct.currency,
                    image: oProduct.image,
                    quantity: parseInt(iQuantity)
                });
            }

            oModel.setProperty("/cart", aCart);
            // Calcular el total general del carrito
            const fTotalCart = aCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            oModel.setProperty("/totalCart", fTotalCart.toFixed(2));

            oModel.refresh();
            MessageToast.show(`${iQuantity} unidad(es) agregadas al carrito`);
        },
               
        onAddToFavorites: function() {
            // Implementación para añadir a favoritos
            const oBindingContext = this.getView().getBindingContext("ModelProductsOnly");
            const oProduct = oBindingContext.getObject();
            
            MessageToast.show(`"${oProduct.name}" añadido a favoritos`);
        },
    });
});