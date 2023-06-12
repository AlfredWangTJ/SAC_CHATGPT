(function () {
  let tmpl = document.createElement("template");
  tmpl.innerHTML = `
          <style>
          div{
                border: 1px solid #000000
            }
          </style>
          <div id = "sacchatgptmain">
            <slot name="analyze_button"></slot>
            <p id = "sacchatgpt"></p>
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

      //Custom Data
      this.setModel("Cnd84a1tvj5fm3onlqvmnph675v");
      this.addDimension("ZDATE");
      this.addDimension("ZENN_ESG_ACCOUNT");
      this.addDimension("ZENN_ESG_ENTITY");
      this.addDimension("ZCUSTOM1");
      this.addMeasure("M_VALUE");

    }

    //properties
    onCustomWidgetBeforeUpdate(oChangedProperties) {
        this._props = { ...this._props, ...oChangedProperties };
      console.log(this);
    }
    onCustomWidgetAfterUpdate(oChangedProperties) {
      if (this._props.designMode == false) {

      }
      console.log(this);
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
      return this.dataBindings.getDataBinding("customDataBinding").getDataSource();
    }
    setModel(modelId) {
      console.log(this);
      return this.dataBindings.getDataBinding("customDataBinding").setModel(modelId);
    }
    openSelectModelDialog() {
      return this.dataBindings.getDataBinding("customDataBinding").openSelectModelDialog();
    }
    getDimensions() {
      return this.dataBindings.getDataBinding("customDataBinding").getDimensions("dimensions");
    }
    addDimension(dimensionId) {
      return this.dataBindings
        .getDataBinding("customDataBinding")
        .addDimensionToFeed("dimensions", dimensionId);
    }
    removeDimension(dimensionId) {
      return this.dataBindings.getDataBinding("customDataBinding").removeDimension(dimensionId);
    }
    getMeasures() {
      return this.dataBindings.getDataBinding("customDataBinding").getMembers("measures");
    }
    addMeasure(measureId) {
      return this.dataBindings
        .getDataBinding("customDataBinding")
        .addMemberToFeed("measures", measureId);
    }
    removeMeasure(measureId) {
      return this.dataBindings.getDataBinding("customDataBinding").removeMember(measureId);
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
  }

  customElements.define("com-sap-alfred-chatgpt", SacChatGpt);
})();
