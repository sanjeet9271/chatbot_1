import { Component,OnInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-chatbox',
  standalone: false,
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css'
})
export class ChatboxComponent implements OnChanges {
  @Input() inputMessages: { text: string; sender: string; image:string; }[] = [];
  @Input() session_id!:string;
  @Input() access_token!:string;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages = [   {
      text: 'Hello, how can I help you?',
      sender: 'bot',
      image: ''
    },
  ];


  //Here goes the whole logic of API
  assistant_id = environment.assistant_id;

  headers = {
    "content-type": "application/json",
    "authorization": ""
  }

  url = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${this.assistant_id}/messages`

  body = {
    "stream": "false",
    "model_id": "gpt-4o",
    "session_id":"",
    "message" : ""
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputMessages']) {
      const newMessages = changes['inputMessages'].currentValue;
      console.log(newMessages)
      if(newMessages.length > 0) {
        let newMessage  = newMessages[newMessages.length-1];
        this.messages = [...this.messages, newMessage];
        this.inputMessages = [];
        this.scrollToBottom();
        this.body.message = newMessage.text;
        if(newMessage.sender==="user" && this.body.message != "Image successfully uploaded!"){
          this.makeRequest();
        }
      }
    }
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 0)
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  private async makeRequest() {
    try {
      this.body.session_id = this.session_id;
      this.headers.authorization = `Bearer ${this.access_token}`
      const response = await fetch(this.url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(this.body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.messages = [...this.messages, { text: data.message, sender: 'bot',image:'' }];
      this.scrollToBottom();
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
}
