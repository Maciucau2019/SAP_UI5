sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel"
], function (Controller, MessageToast, Fragment, ResourceModel) {
   "use strict";
   return Controller.extend("org.ubb.books.controller.BookList", {

        onInit: function(){
            this.book = {
                ISBN : "",
                Title:"",
                Author:"",
                DatePublished: "",
                Language:"",
                TotalNumber:"",
                AvailableNumber: 0
            }
        },

        onCheckoutBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (!aSelContext.length == 0){
                MessageToast.show("Merge!");
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionCheckoutError"));
            }
        },

        onInsertBook(oEvent){
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.insert",this);
            }
            this.resetBook();
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().addDependent(this.newBookDialog);
            this.newBookDialog.setModel(oModel);
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.open();
        },

        onUpdateBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContext.length != 0){
                var oBook = aSelContext[0].getObject();
                oBook = this.parseDatePublishedForUpdate(oBook);
                this.book = oBook;
                if(!this.updateBookDialog){
                    this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.update",this);
                }
                var oModel = new sap.ui.model.json.JSONModel();
                this.getView().addDependent(this.updateBookDialog);
                this.updateBookDialog.setModel(oModel);
                this.updateBookDialog.getModel().setData(this.book);
                this.updateBookDialog.open();
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionUpdateError"));
            }
        },

        onDeleteBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContexts.length != 0){
                const sBookPath = aSelContexts[0].getPath();
                this.getView().getModel().remove(sBookPath);
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionDeleteError"));
            }
        },

        parseDatePublishedForCreate(oBook){
            var dateString = oBook.DatePublished;
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
            var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
            oBook.DatePublished ="\/Date(" + parsedDate + ")\/";
            return oBook;
        },

        parseDatePublishedForUpdate(oBook){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" }); 
            var date = new Date(oBook.DatePublished);
            var dateStr = dateFormat.format(date);
            oBook.DatePublished = dateStr;
            // oBook = this.parseDatePublishedForCreate(oBook);
            return oBook;
        },
    
        saveBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.validateBook(this.book)){
                this.book = this.parseDatePublishedForCreate(this.book);
                var oModel = this.getView().getModel();
                oModel.create('/Books', this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("saveSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("saveError"));
                    }
                });
                this.newBookDialog.close();
            }
        },

        updateBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.validateBook(this.book)){
                this.book = this.parseDatePublishedForCreate(this.book);
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                const sBookPath = aSelContexts[0].getPath();
                var oModel = this.getView().getModel();
                oModel.update(sBookPath, this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("updateSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("updateError"));
                    }
                });
                this.updateBookDialog.close();
            }
        },

        closeDialog(oEvent){
            if (this.newBookDialog){
                this.newBookDialog.close();
            }
            if (this.updateBookDialog){
                this.updateBookDialog.close();
            }
        },

        resetBook(){
            this.book.ISBN = "";
            this.book.Title = "";
            this.book.Author = "";
            this.book.DatePublished = "";
            this.book.Language = "";
            this.book.TotalNumber = 0;
            this.book.AvailableNumber = 0;
        },

        validateBook(oBook){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (oBook.ISBN.length === 0){
                MessageToast.show(oResourceBundle.getText("isbnEmptyError"));
                return false;
            }
            if (oBook.ISBN.length > 13){
                MessageToast.show(oResourceBundle.getText("isbnLongerThan13Error"));
                return false;
            }
            if (oBook.Title.length === 0){
                MessageToast.show(oResourceBundle.getText("titleEmptyError"));
                return false;
            }
            if (oBook.Author.length === 0){
                MessageToast.show(oResourceBundle.getText("authorEmptyError"));
                return false;
            }
            if (oBook.DatePublished.length === 0){
                MessageToast.show(oResourceBundle.getText("dateEmptyError"));
                return false;
            }
            if (oBook.Language.length === 0){
                MessageToast.show(oResourceBundle.getText("languageEmptyError"));
                return false;
            }
            if (parseInt(oBook.TotalNumber) < 0){
                MessageToast.show(oResourceBundle.getText("totalNumberNegativeError"));
                return false;
            }
            if (parseInt(oBook.AvailableNumber) < 0){
                MessageToast.show(oResourceBundle.getText("availableNumberNegativeError"));
                return false;
            }
            if (parseInt(oBook.TotalNumber) < parseInt(oBook.AvailableNumber)){
                MessageToast.show(oResourceBundle.getText("totalNumberError"));
                return false;
            }
            return true;
        }
    });
});