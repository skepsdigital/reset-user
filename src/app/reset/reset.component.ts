import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss'
})
export class ResetComponent implements OnInit {


  queryParticipant = '';

  result = false;
  userFound = false;

  loading = false;

  flowId = ''
  botSlug = '';
  botKey = ''

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let botSlug = this.route.snapshot.paramMap.get('botSlug');
    let flowId = this.route.snapshot.paramMap.get('flowId');

    if (botSlug && flowId) {
      this.botSlug = botSlug;
      this.flowId = flowId;
    }
  }

  async sendWelcomeMsg() {

    this.loading = true;

    try {
      const userContext = await this.getContextContact();
      if (userContext && userContext.resource && userContext.resource.items) {
        const variableArray = userContext.resource.items;
        await this.deleteVariable(variableArray);
      }
      await this.setContact();
      await this.send();
      this.result = true;
    } catch (e) {
      throw e;
    }

    this.loading = false;
  }

  async reset() {
    this.result = false;
    this.queryParticipant = '';
  }

  async send() {
    await this.http.post('https://blipnotificationsender.azurewebsites.net/api/trigger', {
      "routerBotKey": "d2xja2NvbnN1bHRpbmc6T1oyWUhRc2k5MkloYlVtc2hkVkc=",
      "botKey": this.botKey,
      "botSlug": this.botSlug,
      "phone": this.queryParticipant,
      "namespace": "51f27719_6d99_4e9e_9d3e_6ea509024652",
      "templateName": "testar_bot",
      "parameters": [],
      "stateId": "onboarding",
      "flowId": this.flowId,
      "contactExtras": {}
    }).toPromise();
  }

  async getContextContact() {
    const url = 'https://wlck.http.msging.net/commands';
    const headers = {
      'Authorization': 'Key d2xja2NvbnN1bHRpbmc6T1oyWUhRc2k5MkloYlVtc2hkVkc=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
    if (!formattedParticipant.startsWith('55')) {
      formattedParticipant = '55' + formattedParticipant;
    }

    const data = {
      "id": uuidv4(),
      "to": "postmaster@msging.net",
      "method": "get",
      "uri": `/contexts/${formattedParticipant}@wa.gw.msging.net`
    };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer a requisição:', error.response ? error.response.data : error.message);
    }
  }

  async deleteVariable(variableArray: any) {
    const url = 'https://wlck.http.msging.net/commands';
    const headers = {
      'Authorization': 'Key d2xja2NvbnN1bHRpbmc6T1oyWUhRc2k5MkloYlVtc2hkVkc=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
    if (!formattedParticipant.startsWith('55')) {
      formattedParticipant = '55' + formattedParticipant;
    }

    for (let variable of variableArray) {
      const formattedVariable = variable.replace(/ /g, '%20');

      const data = {
        "id": uuidv4(),
        "to": "postmaster@msging.net",
        "method": "delete",
        "uri": `/contexts/${formattedParticipant}@wa.gw.msging.net/${formattedVariable}`
      };

      try {
        await axios.post(url, data, { headers });
      } catch (error: any) {
        console.error('Erro ao fazer a requisição:', error.response ? error.response.data : error.message);
      }
    }

    return true;
  }

  async setContact() {
    const url = 'https://wlck.http.msging.net/commands';
    const headers = {
      'Authorization': 'Key d2xja2NvbnN1bHRpbmc6T1oyWUhRc2k5MkloYlVtc2hkVkc=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
    if (!formattedParticipant.startsWith('55')) {
      formattedParticipant = '55' + formattedParticipant;
    }

    const data = {
      "id": uuidv4(),
      "method": "set",
      "uri": "/contacts",
      "type": "application/vnd.lime.contact+json",
      "resource": {
        "identity": `${formattedParticipant}@wa.gw.msging.net`,
        "extras": {
        }
      }
    };
    try {
      await axios.post(url, data, { headers });
    } catch (error: any) {
      console.error('Erro ao fazer a requisição:', error.response ? error.response.data : error.message);
    }

    return data
  }
}
