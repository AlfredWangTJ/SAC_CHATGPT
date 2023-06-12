(function () {
  let template = document.createElement("template");
  template.innerHTML = `
		<form id="form">
			<fieldset>
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
				<input type="submit" style="display:none;">
			</fieldset>
		</form>
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
    }

    _submit(e) {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("propertiesChanged", {
          detail: {
            properties: {
              token: this.token,
              prompt: this.prompt,
            },
          },
        })
      );
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
  }

  customElements.define("com-sap-alfred-chatgpt-builder", SacChatGptBld);
})();
