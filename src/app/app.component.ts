import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { environment } from '../enviroments/enviroment';
import { v4 as uuidv4 } from 'uuid';
import { AgentServicesService } from '../services/agent-services.service';

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
  messages: { text: string; sender: string; image: string; }[] = [];
  session_id!:string;

  access_token:string = environment.access_token;
  assistant_id:string = environment.assistant_id;

  headers = {
    "content-type": "application/json",
    "authorization": `Bearer ${this.access_token}`
  }

  url = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${this.assistant_id}/files`

  @ViewChild(ChatboxComponent) chatboxComponent!: ChatboxComponent;

  //Defining the Constructor here
  constructor(private agentService:AgentServicesService){}
  
  ngOnInit() {
    const dropzone = document.querySelector('modus-file-dropzone');
    this.session_id = uuidv4();

    if (dropzone) {
      dropzone.addEventListener('files', (event: any) => {
        const [files, error] = event.detail;
        if (files) {
          this.uploadedFiles = files; 
          const file = this.uploadedFiles[files.length - 1];
          // console.log(file);
          //Here check if filetype is image....if it is then handleImage request function should run else normal makerequest
          if(file && file.type.startsWith('image/')){
              const reader = new FileReader();
              reader.onload = (e:any) =>{
                let imgSrc = e.target.result;
                this.messages = [...this.messages,{text: "Image successfully uploaded!", sender: 'user' ,image: imgSrc}];
                let image_instruction = `Classify the given image into a category like Animal,place,human,plant or whatever category you feel appropriate along with proper reasoning why you feel so. if it doesn't belong to that category, it returns I cannot answer for this kind of image. `;
                this.chatWithImageAgent(this.assistant_id,imgSrc,this.session_id,image_instruction).then((response:any) =>{
                  // console.log("The response is",response);
                  this.messages = [...this.messages,{text: response, sender: 'bot' ,image: ""}];
                }).catch((error)=>{
                  console.log("The error occured in image agent!",error)
                });
              }

              reader.onerror=(e)=>{
                console.log("Error processing Image",e)
              }

              reader.readAsDataURL(file);
              // this.agentService.GetAssistantResponseForMessageWithImage(this.assistant_id,)
          }else{
            this.makeRequest(this.uploadedFiles[0])
            console.log(this.uploadedFiles[0].name)
          }
        }
        // console.log(files);
        // console.log(error);
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
        this.messages = [...this.messages, { text: this.newMessage, sender: 'user' ,image: "" }];
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
      this.messages = [...this.messages, { text: file_upload_message, sender: 'bot',image:"" }];
      console.log(data)
    } catch (err) {
      console.error('Request failed', err);
    }
  }

  private async chatWithImageAgent(agent_name: string, base64_string: string, session_id: string, message: string){
    base64_string = base64_string.split(',')[1];
    const image_upload = await this.agentService.UploadImageToAssistant(agent_name, base64_string, session_id);
    const agent_response = await this.agentService.GetAssistantResponseForMessageWithImage(agent_name, image_upload, session_id, message);
    return agent_response;
  }
  
}