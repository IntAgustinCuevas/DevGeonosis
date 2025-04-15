sap.ui.define([
    "devgeonosis/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
    "use strict";

    return BaseController.extend("devgeonosis.controller.Catalog", {
        onInit: function () {
            const oTree = this.byId("CategoryTree");
            oTree.attachSelectionChange(this.onCategorySelectionChange, this);
        },
        /* FILTRA LA TABLA DE PRODUCTOS SEGUN LO SELECCIONADO EN EL CATALOGO */
        onCategorySelectionChange: function(oEvent) {
            const oTree = this.byId("CategoryTree");
            // const aSelectedItems = oTree.getSelectedItems(); 
            const aSelectedContexts = oTree.getSelectedContexts(true);

            // SI NO HAY NINGUNA CATEGORIA/SUBCATEGORIA SELECCIONADA, MUESTRA TODOS LOS PRODUCTOS //
            if (aSelectedContexts.length === 0) {
                // Restaurar todos los productos
                const oModel = this.getOwnerComponent().getModel("productsModel");
                const oData = oModel.getData();
                const aAllProducts = [];
            
                oData.catalog.categories.forEach((category) => {
                    category.subcategories.forEach((subcat) => {
                        aAllProducts.push(...subcat.products);
                    });
                });
            
                const oModelAll = new sap.ui.model.json.JSONModel(aAllProducts);
                this.getOwnerComponent().setModel(oModelAll, "ModelProductsOnly");
                return;
            }
            // ACTUALIZA EL MODELO DE PRODUCTOS A MOSTRAR SEGUN LO SELECCIONADO EN EL CATALOGO //
            const aContextsName = aSelectedContexts.map(ctx => ctx.getProperty("name"));

            const oModel = this.getOwnerComponent().getModel("productsModel");
            const oData = oModel.getData();

            const aFilteredProducts = [];

            oData.catalog.categories.forEach((category) => {
                if(aContextsName.includes(category.name)) {
                    category.subcategories.forEach((subcat) => {
                        aFilteredProducts.push(...subcat.products);
                    });
                } else {
                    category.subcategories.forEach((subcat) => {
                        if(aContextsName.includes(subcat.name)) {
                            aFilteredProducts.push(...subcat.products);
                        }
                    });
                }
            });

            const oFilteredModel = new JSONModel(aFilteredProducts);
            this.getOwnerComponent().setModel(oFilteredModel,"ModelProductsOnly");
        },
        onClearCategorySelection: function() {
            const oTree = this.byId("CategoryTree");
            
            // Deseleccionar todos los items
            oTree.removeSelections();
            
            // Cargar todos los productos (Reutilizamos la lógica ya existente)
            const oModel = this.getOwnerComponent().getModel("productsModel");
            const oData = oModel.getData();
            const aAllProducts = [];
        
            oData.catalog.categories.forEach((category) => {
                category.subcategories.forEach((subcat) => {
                    aAllProducts.push(...subcat.products);
                });
            });
        
            const oModelAll = new JSONModel(aAllProducts);
            this.getOwnerComponent().setModel(oModelAll, "ModelProductsOnly");
        }
    });
});