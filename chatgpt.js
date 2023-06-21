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
    }

    onCustomWidgetAfterUpdate(oChangedProperties) {
      console.log("onCustomWidgetAfterUpdate");
      console.log(oChangedProperties);
    }

    //methods
    _renderAnalyzeButton() {
      let buttonSlot = document.createElement("div");
      buttonSlot.slot = "analyze_button";
      this.appendChild(buttonSlot);

      this._analyzeButton = new sap.m.Button({
        text: "分析数据",
        press: () => {
          this.analyze();
        },
      });
      this._analyzeButton.placeAt(buttonSlot);
    }
    _prepareData() {
      console.log("_prepareData");
      if (this.source === "DataBinding") {
        let datasource = this.gptDataSource;
        console.log(datasource);
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
        this.jsonData = "{data: " + JSON.stringify(dataset) + "}";
      }
      this.prompt = this.prompt + this.jsonData;
      console.log(this.prompt);
    }
    analyze() {
      this._prepareData();

      // let reqbody = {
      //   model: "gpt-3.5-turbo",
      //   messages: [{ role: "user", content: this.prompt }],
      // };

      // console.log(JSON.stringify(reqbody));

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

    getPrompt() {
      return this.prompt;
    }
    setPrompt(newPrompt) {
      this.prompt = newPrompt;
    }
    getJson() {
      return this.jsonData;
    }
    setJson(newVal) {
      this.jsonData = newVal;
    }
    getDataSource() {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .getDataSource();
      }
    }
    getModel() {
      return this.modelId;
    }
    setModel(modelId) {
      if (this.dataBindings) {
        let result = this.dataBindings
          .getDataBinding("gptDataSource")
          .setModel(modelId);
        if (result) {
          console.log("setModel: " + modelId + ",result: Success");
          this.modelId = modelId;
        } else {
          console.log("setModel: " + modelId + ",result: Failed");
        }
      }
    }
    openSelectModelDialog() {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .openSelectModelDialog();
      }
    }
    getDimensions() {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .getDimensions("dimensions");
      }
    }
    addDimension(dimensionId) {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .addDimensionToFeed("dimensions", dimensionId);
      }
    }
    removeDimension(dimensionId) {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .removeDimension(dimensionId);
      }
    }
    getMeasures() {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .getMembers("measures");
      }
    }
    addMeasure(measureId) {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .addMemberToFeed("measures", measureId);
      }
    }
    removeMeasure(measureId) {
      if (this.dataBindings) {
        return this.dataBindings
          .getDataBinding("gptDataSource")
          .removeMember(measureId);
      }
    }
    dbg() {
      console.log(this.gptDataSource);
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
    get source() {
      return this._props.source;
    }
    set source(newSource) {
      this._props.source = newSource;
    }
    get modelId() {
      return this._props.modelId;
    }
    set modelId(newModel) {
      this._props.modelId = newModel;
    }
    get jsonData() {
      return this._props.jsonData;
    }
    set jsonData(newVal) {
      this._props.jsonData = newVal;
    }
  }

  customElements.define("com-sap-alfred-chatgpt", SacChatGpt);
})();
