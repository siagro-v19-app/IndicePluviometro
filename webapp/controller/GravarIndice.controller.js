sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecIndicePluviometro/services/Session",
	"br/com/idxtecIndicePluviometro/helpers/PluviometroHelpDialog",
	"br/com/idxtecIndicePluviometro/helpers/UnidadeMedidaHelpDialog"
], function(Controller, History, MessageBox, JSONModel, Session, PluviometroHelpDialog, UnidadeMedidaHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecIndicePluviometro.controller.GravarIndice", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarIndice").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		handleSearchPluviometro: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			PluviometroHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchUnidade: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			UnidadeMedidaHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Índice"
				});
			
				var iEmpresaId = Session.get("EMPRESA_ID");
				var iUsuarioId = Session.get("USUARIO_ID");
				
				var sPathEmpresa = "/Empresas(" + iEmpresaId + ")";
				var sPathUsuario = "/Usuarios(" + iUsuarioId + ")";
			
				var oNovoIndice = {
					"Id": 0,
					"Pluviomentro": 0,
					"UnidadeMedida": 0,
					"Quantidade": 0,
					"Data": new Date(),
					"Observacoes": "",
					"Empresa" : iEmpresaId,
					"Usuario": iUsuarioId,
					"EmpresaDetails": { __metadata: { uri: sPathEmpresa } },
					"UsuarioDetails": { __metadata: { uri: sPathUsuario } }
				};
				
				oJSONModel.setData(oNovoIndice);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Índice"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createIndice();
			} else if (this._operacao === "editar") {
				this._updateIndice();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("indicePluviometro", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			var sPathPluviometro = "/Pluviometros(" + oDados.Pluviomentro + ")";
			var sPathUnidadeMedida = "/UnidadeMedidas(" + oDados.UnidadeMedida + ")";
			
			oDados.PluviometroDetails = { __metadata: { uri: sPathPluviometro } };
			oDados.UnidadeMedidaDetails = { __metadata: { uri: sPathUnidadeMedida } };

			return oDados;
		},
		
		_createIndice: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/IndicePluviomentros", this._getDados(), {
				success: function() {
					MessageBox.success("Índice inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateIndice: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Índice alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("pluviometro").getValue() === "" || oView.byId("unidade").getValue() === ""
			|| oView.byId("data").getDateValue() === "" || oView.byId("quantidade").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		}
	});

});