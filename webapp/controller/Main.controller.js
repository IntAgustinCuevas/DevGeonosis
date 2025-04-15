sap.ui.define([
    "devgeonosis/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], (BaseController, JSONModel, Sorter, Filter, FilterOperator, MessageToast) => {
    "use strict";

    return BaseController.extend("devgeonosis.controller.Main", {

        onInit: function () {
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDefault").attachPatternMatched(this._onPatternMatched, this);
            /* BANDERA DE ORDEN ASCENDENTE PARA FUNCION onChangeOrder */
            this._bOrderAscending = true;

        },
        _onPatternMatched: function () {
            this.getModel("estado").setProperty("/catalogSelectionEnabled", true);
        },
        /* OBTIENE EL PRODUCTO SELECCIONADO DE LA TABLA Y SU RUTA PARA NAVEGAR A LA VISTA DETAIL */
        onProductPress: function (oEvent) {
            const oSelectProduct = oEvent.getSource();
            const sPath = oSelectProduct.getBindingContext("ModelProductsOnly").getPath();
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            console.log("Navigating to Detail with product path: " + sPath);
            oRouter.navTo("RouteDetail",
                {
                    productPath: encodeURIComponent(sPath)
                });
        },
        /* CAMBIA EL ORDEN DE LA TABLA DE PRODUCTOS */
        onChangeOrder: function () {
            this._bOrderAscending = !this._bOrderAscending;

            let oTable = this.byId("TableMainView");
            let oBinding = oTable.getBinding("items");
            let oSorter = new Sorter("price", !this._bOrderAscending)

            oBinding.sort(oSorter);
        },
        /* RESETEA EL INPUT DEL SEARCHFIELD Y EL ORDEN */
        onResetFilters: function () {
            /* SETEA VACIO EL VALOR DEL SEARCHFIELD */
            let oSearchField = this.byId("SearchFieldMain");
            if (oSearchField) {
                oSearchField.setValue("");
            }

            let oTable = this.byId("TableMainView");
            if (oTable) {
                let oBinding = oTable.getBinding("items");
                oBinding.sort(null);
                oBinding.filter([]);
            }
            this._bOrderAscending = true;
        },
        /* APLICA FILTROS DE BUSQUEDA POR NOMBRE DEL PRODUCTO */
        onSearch: function (oEvent) {
            let sSearchValue = oEvent.getSource().getValue();
            let aFilters = [];

            if (sSearchValue && sSearchValue.length > 0) {
                let aSubFilters = [];

                let oNameFilter = new Filter("name", FilterOperator.Contains, sSearchValue);
                aSubFilters.push(oNameFilter);

                let oPriceFilter = new Filter("priceText", FilterOperator.Contains, sSearchValue);
                aSubFilters.push(oPriceFilter);

                let oMaterialFilter = new Filter("details/material", FilterOperator.Contains, sSearchValue);
                aSubFilters.push(oMaterialFilter);

                let oCombinedFilter = new Filter({
                    filters: aSubFilters,
                    and: false
                });

                aFilters.push(oCombinedFilter);
            }


            let oTable = this.byId("TableMainView");
            let oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters, "Application");
        },


        onCartPress: function (oEvent) {
            // Verifica si el popup del carrito ya fue creado
            if (!this._oCartPopOver) {
                // Si no existe aún, lo crea desde el fragmento XML
                this._oCartPopOver = sap.ui.xmlfragment("devgeonosis.view.fragments.CartPopUp", this);
                // Asocia el fragmento al view actual, para que se destruya junto con él
                this.getView().addDependent(this._oCartPopOver);
            }

            // Abre el popup del carrito
            this._oCartPopOver.openBy(oEvent.getSource());
        },
        onFavoritePress: function (oEvent) {
            // Verifica si el popup de la lista de favoritos ya fue creado
            if (!this._oFavoritePopOver) {
                // Si no existe aún, lo crea desde el fragmento XML
                this._oFavoritePopOver = sap.ui.xmlfragment("devgeonosis.view.fragments.FavoritePopOver", this);
                // Asocia el fragmento al view actual, para que se destruya junto con él
                this.getView().addDependent(this._oFavoritePopOver);
            }

            // Abre el popup de la lista de favoritos
            this._oFavoritePopOver.openBy(oEvent.getSource());
        },
        onCloseCartPopOver: function () {
            if (this._oCartPopOver)
                this._oCartPopOver.close();
        },
        onCloseFavoritePopOver: function () {
            if (this._oFavoritePopOver)
                this._oFavoritePopOver.close();
        },
        onDeleteProduct: function (oEvent) {
            const oModel = this.getModel("productsModel");
            const sProductId = oEvent.getSource().getBindingContext("productsModel").getProperty("id");

            let aCart = oModel.getProperty("/cart");

            // Filtramos los productos manteniendo solo los que NO tengan el id que queremos eliminar
            const aUpdatedCart = aCart.filter(product => product.id !== sProductId);
            // Seteamos el carrito actualizado
            oModel.setProperty("/cart", aUpdatedCart);
            // Calculamos el nuevo total
            const fTotalCart = aUpdatedCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            oModel.setProperty("/totalCart", fTotalCart.toFixed(2));

            oModel.refresh();
        },
        onDeleteFavorite: function (oEvent) {
            let oModel = this.getModel("productsModel");
            let sProductId = oEvent.getSource().getBindingContext("productsModel").getProperty("id");

            let aFavorite = oModel.getProperty("/favorite");

            // Filtramos los productos manteniendo solo los que NO tengan el id que queremos eliminar
            let aUpdatedFavorite = aFavorite.filter(product => product.id !== sProductId);
            // Seteamos el carrito actualizado
            oModel.setProperty("/favorite", aUpdatedFavorite);
            oModel.refresh();
        },
        onEmptyCart: function () {
            const oModel = this.getView().getModel("productsModel");

            // Vaciar el array del carrito
            oModel.setProperty("/cart", []);

            // Reiniciar el total a 0
            oModel.setProperty("/totalCart", "0.00");

            // (Opcional) Mostrar mensaje al usuario
            sap.m.MessageToast.show("Carrito vaciado con éxito.");
        },
        onEmptyFavorite: function (oEvent) {
            let oModel = this.getModel("productsModel");

            // Vaciar el array de la lista favoritos
            oModel.setProperty("/favorite", []);
            MessageToast.show("Lista de favoritos vaciada con éxito.");
        },
        onAddToCart: function (oEvent) {
            const oProduct = oEvent.getSource().getBindingContext("ModelProductsOnly").getObject();
            const oModel = this.getModel("productsModel");
            const aCart = oModel.getProperty("/cart");

            const oExisting = aCart.find(item => item.id === oProduct.id);
            if (oExisting) {
                oExisting.quantity++;
            } else {
                aCart.push({
                    ...oProduct,
                    quantity: 1,
                    total: oProduct.price
                });
            }

            oModel.setProperty("/cart", aCart);

            // Calcular el total general del carrito
            const fTotalCart = aCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            oModel.setProperty("/totalCart", fTotalCart.toFixed(2));

            oModel.refresh();
            MessageToast.show("Producto agregado al carrito c:");
        },
    });
});