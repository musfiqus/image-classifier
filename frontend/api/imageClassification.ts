import axios, { AxiosResponse } from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000') + '/image/classify/';

interface ResponseData {
  success: boolean;
  data?: any;
  message?: string;
}

export class ImageClassificationApi {

  async classifyImage(image: File, imageName: string) {
    try {
      const formData = new FormData();
      formData.append('file', image);

      const config = {
        headers: {
          'Content-Disposition': `form-data; name="file"; filename="${imageName}"`
        }
      };

      const response: AxiosResponse<ResponseData> = await axios.post(API_URL, formData, config);
      if (response.data.success) {
        return response.data.data;
      } else {
        console.log(response.data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        // If error is instance of Error, we know it has a message property.
        console.error(error.message);
        throw new Error(error.message);
      } else {
        // If error is not an instance of Error, convert it to string in a safe way.
        console.error(error);
        throw new Error(String(error));
      }
    }
  }
}
