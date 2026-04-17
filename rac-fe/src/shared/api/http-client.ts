// src/shared/api/http-client.ts
class HttpClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5139';
  }
  
  private getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
  
  async get<T>(path: string): Promise<T> {
    const response = await fetch(this.getUrl(path));
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  }
  
  async post<T>(path: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(this.getUrl(path), options);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  }
  
  async put<T>(path: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(this.getUrl(path), options);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  }
  
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(this.getUrl(path), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return response.json();
  }
}


export const apiClient = new HttpClient();