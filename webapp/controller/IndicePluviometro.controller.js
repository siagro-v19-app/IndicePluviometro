sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"br/com/idxtecIndicePluviometro/services/Session"
], function(Controller, MessageBox, JSONModel, Filter, FilterOperator, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecIndicePluviometro.controller.IndicePluviometro", {
		onInit: function() {
			var oParamModel = new JSONModel();
			
			this.getOwnerComponent().setModel(oParamModel, "parametros");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
            var iEmpresaId = Session.get("EMPRESA_ID");
            
			var oFilter = new Filter("Empresa", FilterOperator.EQ, iEmpresaId);
			var oView = this.getView();
			var oTable = oView.byId("tableIndice");
			
			oTable.bindRows({ 
				path: '/IndicePluviomentros',
				sorter: {
					path: 'PluviometroDetails/Descricao'
				},
				filters: oFilter,
				parameters: {
					expand: 'PluviometroDetails,UnidadeMedidaDetails'
				}
			});
		},
		
		filtraIndice: function(oEvent){
			var sQuery = oEvent.getParameter("query").toUpperCase();
			var oFilter1 = new Filter("Empresa", FilterOperator.EQ, Session.get("EMPRESA_ID"));
			var oFilter2 = new Filter("PluviometroDetails/Descricao", FilterOperator.Contains, sQuery);
			
			var aFilters = [
				oFilter1,
				oFilter2
			];

			this.getView().byId("tableIndice").getBinding("rows").filter(aFilters, "Application");
		},
		
		onRefresh: function(e){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableIndice").clearSelection();
		},
		
		onIncluir: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableIndice"); 
			
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({operacao: "incluir"});
			
			oRouter.navTo("gravarIndice");
			oTable.clearSelection();
		},
		
		onEditar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableIndice");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione um Índice na tabela.");
				return;
			}
			
			var sPath = oTable.getContextByIndex(nIndex).sPath;
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({sPath: sPath, operacao: "editar"});
			
			oRouter.navTo("gravarIndice");
			oTable.clearSelection();
		},
		
		onRemover: function(e){
			var that = this;
			var oTable = this.byId("tableIndice");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione um Índice na tabela.");
				return;
			}
			
			MessageBox.confirm("Deseja remover este Índice?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						that._remover(oTable, nIndex);
						MessageBox.success("Índice removido com sucesso!");
					}
				}
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath, {
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				}
			});
		},
		
		getModel: function(){
			return this.getOwnerComponent().getModel();
		}
	});
});