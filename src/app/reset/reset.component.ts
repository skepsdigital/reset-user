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
      await this.setMasterState()
      if (!this.queryParticipant.startsWith('55')) {
        this.queryParticipant = '+' + this.queryParticipant
      }
      await this.apiBlip();
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

  generationToken(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  apiBlip() {
    const url = 'https://wlck.http.msging.net/messages';
    const headers = {
      Authorization: 'Key ZGV2c2tlcHNyb3V0ZXI6cm4xckZKS1FIVFkwa1dNZVBNQXI=',
      'Content-Type': 'application/json'
    };
    const data = {
      id: this.generationToken(10),
      to: `${this.queryParticipant}@wa.gw.msging.net`,
      type: 'application/json',
      content: {
        type: 'template',
        template: {
          name: 'testar_bot',
          language: {
            code: 'pt_BR',
            policy: 'deterministic',
          },
        },
      },
    };

    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log('Response:', response);
      })
      .catch((error) => {
        console.error('Error:', error.response ? error.response.data : error.message);
      });
  }

  async setMasterState() {
    const axios = require('axios');
  
    const url = 'https://wlck.http.msging.net/commands';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Key ZGV2c2tlcHNyb3V0ZXI6cm4xckZKS1FIVFkwa1dNZVBNQXI=',
    };
    
    const data = {
      id: this.generationToken(10),
      to: "postmaster@msging.net",
      method: 'set',
      uri: `/contexts/${this.queryParticipant}@wa.gw.msging.net/Master-State`,
      type: 'text/plain',
      resource: `${this.botSlug}@msging.net`,
    };
    
    axios
      .post(url, data, { headers })
      .then((response:any) => {
        console.log('Response:', response.data);
      })
      .catch((error:any) => {
        console.error('Error:', error.response ? error.response.data : error.message);
      });
    
  }

  async getContextContact() {
    const url = 'https://wlck.http.msging.net/commands';
    const headers = {
      'Authorization': 'Key ZGV2c2tlcHNyb3V0ZXI6cm4xckZKS1FIVFkwa1dNZVBNQXI=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
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
      'Authorization': 'Key ZGV2c2tlcHNyb3V0ZXI6cm4xckZKS1FIVFkwa1dNZVBNQXI=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
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
      'Authorization': 'Key ZGV2c2tlcHNyb3V0ZXI6cm4xckZKS1FIVFkwa1dNZVBNQXI=',
      'Content-Type': 'application/json'
    };

    let formattedParticipant = this.queryParticipant;
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
