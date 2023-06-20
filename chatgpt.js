(function () {
  let tmpl = document.createElement("template");
  tmpl.innerHTML = `
          <style>
          #sacchatgptmain {
                border: 1px solid #000000
            }
          </style>
          <div>
          <div id = "sacchatgptmain" style = "width: 100%; height: 80%">
            <p id = "sacchatgpt" style = "width: 100%"></p>
          </div>
          <div id = "sacchatgptbtn">
            <slot name="analyze_button"></slot>
          </div>
          </div>
        `;

  class SacChatGpt extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      this.addEventListener("evtGptResp", (event) => {
        this.shadowRoot.getElementById("sacchatgpt").textContent =
          event.detail.properties.gptResp;
      });
      this._renderAnalyzeButton();
      this._props = {};
    }

    //properties
    onCustomWidgetBeforeUpdate(oChangedProperties) {
      console.log("onCustomWidgetBeforeUpdate");
      //debugger;
    }

      //Auto call setter & getter function from Bulider/Styling Panel
    onCustomWidgetAfterUpdate(oChangedProperties) {
      console.log("onCustomWidgetAfterUpdate");
      console.log(oChangedProperties);
      //debugger;
      if("modelId" in oChangedProperties){
        this.modelId = oChangedProperties["modelId"];
      }
      if("dimensionList" in oChangedProperties){
        this.dimensionList = oChangedProperties["dimensionList"];
      }
      if("measureList" in oChangedProperties){
        this.measureList = oChangedProperties["measureList"];
      }
    }

    //methods
    getPrompt() {
      return this.prompt;
    }
    setPrompt(newPrompt) {
      this.prompt = newPrompt;
    }
    _renderAnalyzeButton() {
        let buttonSlot = document.createElement("div");
        buttonSlot.slot = "analyze_button";
        this.appendChild(buttonSlot);

        this._analyzeButton = new sap.m.Button({
            text: "分析数据",
            press: () => {
                this.analyze();
            }
        });
        this._analyzeButton.placeAt(buttonSlot);
    }
    prepareData() {
      let datasource = this.getDataSource();
      let data = datasource.data;
      let metadata = datasource.metadata;

      if (!data || !data.length) {
        Application.showMessage(Type.Error, "当前数据源未读取到任何数据");
        return;
      }

      let dimensions = metadata.dimensions;
      let measures = metadata.mainStructureMembers;
      let feeds = metadata.feeds;
      let feedDimensions = feeds.dimensions.values;
      let feedMeasures = feeds.measures.values;
      let dataset = [];

      for (let i = 0; i < data.length; i++) {
        let row = {};
        for (let j = 0; j < feedDimensions.length; j++) {
          row[dimensions[feedDimensions[j]].description] =
            data(i)[feedDimensions[j]].label;
        }
        for (let j = 0; j < feedMeasures.length; j++) {
          row[measures[feedMeasures[j]].label] =
            data(i)[feedMeasures[j]].raw.toString() +
            " " +
            data(i)[feedMeasures[j]].unit;
        }
        dataset.push(row);
      }
      this.dataset = dataset;
    }
    preparePrompt() {
      if (this.data) {
      }
      let datastr = "{";
      let data = this.dataset;
      for (let i = 0; i < data.lengrh; i++) {
        let rowstr = JSON.stringify(data(i));
        datastr = datastr + rowstr;
      }
      datastr = datastr + "}";
      let prompt = this.prompt;
      prompt = prompt + "。数据集如下：" + datastr;
      this.prompt = prompt;
    }
    analyze() {
      if(this.getDimensions().length === 0){
        this.dimensionList = this.dimensionList;
      }
      if(this.getMeasures().length === 0){
        this.measureList = this.measureList;
      }
      console.log("analyze");
      console.log(this.dataBindings);
      console.log(this.dataBindings.getDataBinding("customDataBinding"));
      console.log(this.customDataBinding);
      console.log(this.getDataSource());
      console.log(this.getDimensions());
      console.log(this.getMeasures());
      //debugger;
      this.prepareData();
      this.preparePrompt();

      
      let reqbody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: this.prompt }],
      };

      console.log(JSON.stringify(reqbody));

      /*
      jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + this.token,
        },
        url: "https://api.openai.com/v1/chat/completions",
        dataType: "json",
        async: true,
        data: JSON.stringify(reqbody),
        success: function (data) {
          let generatedText = data.choices[0].message.content;
          var evtGptResp = new CustomEvent("evtGptResp", {
            detail: {
              properties: {
                gptResp: generatedText,
              },
            },
          });
          context.dispatchEvent(evtGptResp);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(textStatus);
        },
      });  */
    }

    //Datasource and DataBinding
    getDataSource() {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").getDataSource();
      }
      
    }
    setModel(modelId) {
      if(this.dataBindings){
        this.dataBindings.getDataBinding("customDataBinding").setModel(modelId);
      }
    }
    openSelectModelDialog() {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").openSelectModelDialog();
      }   
    }
    getDimensions() {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").getDimensions("dimensions");
      }   
    }
    addDimension(dimensionId) {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").addDimensionToFeed("dimensions", dimensionId);
      }
    }
    removeDimension(dimensionId) {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").removeDimension(dimensionId);
      }    
    }
    getMeasures() {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").getMembers("measures");
      }
    }
    addMeasure(measureId) {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").addMemberToFeed("measures", measureId);
      }  
    }
    removeMeasure(measureId) {
      if(this.dataBindings){
        return this.dataBindings.getDataBinding("customDataBinding").removeMember(measureId);
      }    
    }

    //getter and setter
    get prompt() {
      return this._props.prompt;
    }
    set prompt(newPrompt) {
      this._props.prompt = newPrompt;
    }
    get token() {
      return this._props.token;
    }
    set token(newToken) {
      this._props.token = newToken;
    }
    get dataset() {
      return this._props.dataset;
    }
    set dataset(newData) {
      this._props.dataset = newData;
    }
    get source(){
      return this._props.source;
    }
    set source(newSource){
      this._props.source = newSource;
    }
    get modelId(){
      console.log("get modelId()");
      return this._props.modelId;
    }
    set modelId(newModel){
      console.log("set modelId()");
      this._props.modelId = newModel;
      this.setModel(newModel)
    }
    get dimensionList(){
      return this._props.dimensionList;
    }
    set dimensionList(newDimStr){
      console.log("set dimensionList");
      this._props.dimensionList = newDimStr;
      let dimArr = newDimStr.split(",");
      for(let i = 0; i < dimArr.length; i++){
        let dim = dimArr[i];
        console.log(dim);
        this.addDimension(dim);
      }
    }
    get measureList(){
      return this._props.measureList;
    }
    set measureList(newMeaStr){
      console.log("set measureList");
      this._props.measureList = newMeaStr;
      let meaArr = newMeaStr.split(",");
      for(let i = 0; i < meaArr.length; i++){
        let mea = meaArr[i];
        console.log(mea);
        this.addMeasure(mea);
      }
    }
  }

  customElements.define("com-sap-alfred-chatgpt", SacChatGpt);
})();
