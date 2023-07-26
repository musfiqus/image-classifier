import axios, {AxiosResponse} from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000') + '/image';

interface Prediction {
    classes: string[];
    probabilities: number[];
}

export interface ImageClassification {
    image_hash: string;
    classification_model: string;
    labels_url: string;
    predictions: Prediction;
    date_created: string;
    date_updated: string;
}

interface ResponseData {
    success: boolean;
    data?: ImageClassification;
    message?: string;
}

export class ImageClassificationApi {

    async classifyImage(image: File, imageName: string): Promise<ResponseData['data']> {
        try {
            const config = {
                headers: {
                    'Content-Disposition': `form-data; name="file"; filename="${imageName}"`
                }
            };

            const response: AxiosResponse<ResponseData> = await axios.post(`${API_URL}/classify/`, image, config);
            if (response.data.success) {
                return response.data.data;
            } else {
                console.log(response.data.message);
                throw new Error(response.data.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
                throw new Error(error.message);
            } else {
                console.error(error);
                throw new Error(String(error));
            }
        }
    }

    async getImageClassification(image_hash: string): Promise<ResponseData['data']> {
        try {
            const response: AxiosResponse<ResponseData> = await axios.get(`${API_URL}/get_classification/?image_hash=${image_hash}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                console.log(response.data.message);
                throw new Error(response.data.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
                throw new Error(error.message);
            } else {
                console.error(error);
                throw new Error(String(error));
            }
        }
    }
}
