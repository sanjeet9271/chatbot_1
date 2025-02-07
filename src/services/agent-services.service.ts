import { Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AgentServicesService {
  constructor() { }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  private async retryRequest<T>(requestFn: () => Promise<T>, retries: number = 3): Promise<T | undefined> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try{
        const result = await requestFn();
        if (result !== undefined) {
          return result;
        }
      } catch (error) {
        if(attempt === retries - 1){
          console.error('Failed after 3 retries');
        }
      }
    }
    return undefined;
  }

  public async UploadImageToAssistant(agent_name: string, base64_string: string, session_id: string): Promise<string | undefined>{
    const requestFn = async () => {
      const trimbleAssistantImageURL = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${agent_name}/sessions/${session_id}/images`
      const byte_data = this.base64ToBlob(base64_string, 'image/png');

      const formBody = new FormData();
      formBody.append('image_file', byte_data, 'image.png');

      const accessToken = environment.access_token;
      const response = await fetch(trimbleAssistantImageURL, {
          headers: new Headers(
            {
              'Authorization': 'Bearer ' + accessToken
            }
          ),
          method: 'POST',
          body: formBody,
        })
      
      if (response.status !== 200) {
        return undefined;
      }
      
      // get the response.text() and return the blob storage path
      const responseData = await response.json();
      return responseData;
    }
    return this.retryRequest(requestFn);
  }

  public async GetAssistantResponseForMessageWithImage(agent_name: string, blob_storage_path: string|undefined, session_id: string, message: string): Promise<string | undefined> {
    const requestFn = async () => {
      let parameters = {
        "message": message,
        "stream": false,
        "model_id": "gpt-4o",
        "session_id": session_id,
        "blob_url": blob_storage_path
      }
      const formBody = JSON.stringify(
        Object.fromEntries(
          Object.entries(parameters).map(([key, value]) => [key, value ?? ''])
        )
      ); 
      
      const accessToken = environment.access_token;
      const trimbleAssistantMessageURL = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${agent_name}/messages`;
      const response: any = await fetch(trimbleAssistantMessageURL, {
        headers: new Headers(
          {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          }
        ),
        method: 'POST',
        body: formBody,
      })

      if (response.status !== 200) {
        return undefined;
      }

      const responseData = await response.json();
      return responseData.message;
    }
    return this.retryRequest(requestFn);
  }
}
