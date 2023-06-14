(function () {
  let template = document.createElement("template");
  template.innerHTML = `
		<form id="form">
			<fieldset id = "OpenAI">
				<legend>OpenAI API配置</legend>
				<table>
					<tr>
						<td>OpenAI API Token</td>
						<td><input id="token" type="text"></td>
					</tr>
					<tr>
						<td>Prompt Question</td>
						<td><input id="prompt" type="text"></td>
					</tr>                                        
				</table>
			</fieldset>
      <p></p>
			<fieldset id = "DataSrc">
				<legend>数据来源选择</legend>
				<table>
					<tr>
						<td>数据来源</td>
						<td>
              <input type="radio" id = "DataBinding" name = "source" value = "DataBinding" checked = "checked"/> DataBinding  
              <input type="radio" id = "JSON" name = "source" value = "JSON"/> JSON  
            </td>
					</tr>                                    
				</table>
			</fieldset>  
      <p></p>    
			<fieldset id = "DataBindingSetting" style="display:none;">
				<legend>DataBinding配置</legend>
				<table>
					<tr>
						<td>Model TechID</td>
						<td><input id="modelId" type="text"></td>
					</tr>
					<tr>
						<td>Dimension List</td>
						<td><input id="dimensionList" type="text"></td>
					</tr>  
					<tr>
						<td>Measure List</td>
						<td><input id="measureList" type="text"></td>
					</tr>                                                          
				</table>
			</fieldset>
      <input type="submit" style="display:none;">
		</form>
    <p></p>
    <div id = "btn">
    <slot name="yes"></slot>
    </div>
		<style>
		:host {
			display: block;
			padding: 1em 1em 1em 1em;
		}
		</style>
	`;

  class SacChatGptBld extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._shadowRoot
        .getElementById("form")
        .addEventListener("submit", this._submit.bind(this));
      this._renderButton();
    }

    _submit(e) {
      let oProps = {detail:{properties:{}}};
      if(this.token){
        oProps.detail.properties.token = this.token;
      };
      if(this.prompt){
        oProps.detail.properties.prompt = this.prompt;
      };
      if(this.source){
        oProps.detail.properties.source = this.source;
      };
      if(this.modelId){
        oProps.detail.properties.modelId = this.modelId;
      };
      if(this.dimensionList){
        oProps.detail.properties.dimensionList = this.dimensionList;
      };
      if(this.measureList){
        oProps.detail.properties.measureList = this.measureList;
      };

      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("propertiesChanged", oProps)
      );
    }

    _renderButton() {
      let buttonSlot = document.createElement("div");
      buttonSlot.slot = "yes";
      this.appendChild(buttonSlot);

      this._Button = new sap.m.Button({
          text: "确定",
          press: () => {
            this._shadowRoot.getElementById("form").submit;
          }
      });
      this._Button.placeAt(buttonSlot);
  }

    set token(newToken) {
      this._shadowRoot.getElementById("token").value = newToken;
    }
    get token() {
      return this._shadowRoot.getElementById("token").value;
    }
    set prompt(newPrompt) {
      this._shadowRoot.getElementById("prompt").value = newPrompt;
    }
    get prompt() {
      return this._shadowRoot.getElementById("prompt").value;
    }
    set source(newSource){
      if(newSource === "JSON"){
        this._shadowRoot.getElementById("DataBinding").checked = false;
        this._shadowRoot.getElementById("JSON").checked = true;
      }else if(newSource === "DataBinding"){
        this._shadowRoot.getElementById("DataBinding").checked = true;
        this._shadowRoot.getElementById("JSON").checked = false;
      }else{
        this._shadowRoot.getElementById("DataBinding").checked = true;
        this._shadowRoot.getElementById("JSON").checked = false;
      }
    }
    get source(){
      let DataBinding = this._shadowRoot.getElementById("DataBinding").checked;
      if(DataBinding){
        return "DataBinding";
      }else{
        return "JSON";
      }
    }
    set modelId(newModel){
      this._shadowRoot.getElementById("modelId").value = newModel;
    }
    get modelId(){
      return this._shadowRoot.getElementById("modelId").value;
    }       
    set dimensionList(newDimStr){
      this._shadowRoot.getElementById("dimensionList").value = newDimStr;
    }
    get dimensionList(){
      return this._shadowRoot.getElementById("dimensionList").value;
    }    
    set measureList(newMeaStr){
      this._shadowRoot.getElementById("measureList").value = newMeaStr;
    }
    get measureList(){
      return this._shadowRoot.getElementById("measureList").value;
    }      
  }

  customElements.define("com-sap-alfred-chatgpt-builder", SacChatGptBld);
})();
