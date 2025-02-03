import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chatbot';
  uploadedFiles: any[] = []; 
  newMessage: string = '';
  messages: { text: string; sender: string; }[] = [];
  session_id!:string;

  access_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzM4MjQwNTA5LCJuYmYiOjE3MzgyMzY5MDksImlhdCI6MTczODIzNjkwOSwianRpIjoiMWJjMzM3MTMzOGUyNDZhZjgxOGY4Y2U4OTQ4MzMyNjIiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJhdWQiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImF1dGhfdGltZSI6MTczODIzNjkwNywiYW1yIjpbImZlZGVyYXRlZCIsIm9rdGFfdHJpbWJsZSIsIm1mYSJdLCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhdF9oYXNoIjoicmJZVVh4QUJuQTFsRlBlbmlGaHhUZyIsImFjY291bnRfaWQiOiJ0cmltYmxlLXBsYWNlaG9sZGVyLW9mLWVtcGxveWVlcyIsImZlZGVyYXRpb25fb3JpZ2luIjoib2t0YV90cmltYmxlIiwiZ2l2ZW5fbmFtZSI6IlNhbmplZXQiLCJmYW1pbHlfbmFtZSI6Ikt1bWFyIiwiZW1haWwiOiJzYW5qZWV0X2t1bWFyQHRyaW1ibGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpY3R1cmUiOiJodHRwczovL3VzLmlkLnRyaW1ibGUuY29tL3VpL3Jlc291cmNlcy9kZWZhdWx0X3Byb2ZpbGUucG5nP3Y9MSIsImRhdGFfcmVnaW9uIjoidXMifQ.DSBTNpyj-oEmUbfMsaS96XX0f2u4fbZFKryCAkbqB3Akw7IvokMLo8M3_2len_XRsENjsBXykL03UZndDBl3NjFSt_MI-YuaDkJ4SB_AGVPst_cka9Qc2im0ZJMpGzhAnBq4ZF5F4MnO2EZkeiK7io4VjVbecC9YlVAmpgFKhsrmxaIAoNuLn6CCIbfSwJwpPUwcJHvngRA2FtA623fU4AdAII-RKWOYYdO5he2sfVVGo_l50UA15Pb0K35nT5vryJNT548Yj0InVV8yW3_hlAQezY2e1sJtSHRPVsYFE88X2dN9QOR-OJ88DiPudQ3rDOU6_GhJChxCejc6WiPHFw";
  assistant_id = "sampleassistant";

  headers = {
    "content-type": "application/json",
    "authorization": `Bearer ${this.access_token}`
  }

  url = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${this.assistant_id}/files`

  @ViewChild(ChatboxComponent) chatboxComponent!: ChatboxComponent;
  
  ngOnInit() {
    const dropzone = document.querySelector('modus-file-dropzone');
    this.session_id = uuidv4();

    if (dropzone) {
      dropzone.addEventListener('files', (event: any) => {
        const [files, error] = event.detail;
        if (files) {
          this.uploadedFiles = files; 
          this.makeRequest(this.uploadedFiles[0])
          console.log(this.uploadedFiles[0].name)
        }
        console.log(files);
        console.log(error);
      });
    }
  }

  onValueChange(event: any): void {
    this.newMessage = event.detail;
    event.preventDefault();
  }

  onKeyDown(event: KeyboardEvent | MouseEvent): void {
    if ((event instanceof KeyboardEvent && event.key === 'Enter') || event instanceof MouseEvent) {
      event.preventDefault();
      if (this.newMessage.trim()) {
        this.messages = [...this.messages, { text: this.newMessage, sender: 'user' }];
        this.newMessage = '';
      }
    }
  }

  public async makeRequest(file: File) {
    try {
      console.log("the session id : ",this.session_id);
      const formData = new FormData();
  
      // Create the agent_request object
      const agentRequest = {
        session_id: this.session_id,
        model_id: 'gpt-4o'
      };
  
      formData.append('agent_request', JSON.stringify(agentRequest));
  
      formData.append('file', file, file.name);
  
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          "authorization": `Bearer ${this.access_token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! in appComp status: ${response.status}`);
      }
  
      const data = await response.json();
      let file_upload_message = "Your file is successfully uploaded!"
      this.messages = [...this.messages, { text: file_upload_message, sender: 'bot' }];
      console.log(data)
    } catch (err) {
      console.error('Request failed', err);
    }
  }
}