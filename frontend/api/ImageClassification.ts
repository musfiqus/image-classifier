import axios, {AxiosResponse} from 'axios';
import { getFileExtension, getImageHash } from '@/utils'

const API_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000') + '/image';

interface Prediction {
    classes: string[];
    probabilities: number[];
}

export interface ImageClassification {
    image_hash: string;
    classification_model: string;
    labels_url: string;
    in_queue: boolean;
    predictions: Prediction | null;
    date_created: string;
    date_updated: string;
}

interface ResponseData {
    success: boolean;
    data: ImageClassification | null;
    message: string;
}

export class ImageClassificationApi {

    async classifyImage(image: File): Promise<ResponseData['data']> {
        try {
            const fileExtension = getFileExtension(image)
            const imageHash = await getImageHash(image)
            const config = {
                // This header is required for Django rest_framework to handle files
                headers: {
                    'Content-Disposition': `form-data; name="file"; filename="${imageHash}.${fileExtension}"`
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

    async getImageClassification(image: File, checkProgress: boolean): Promise<ResponseData['data']> {
        try {
            const imageHash = await getImageHash(image)
            const response: AxiosResponse<ResponseData> = await axios.get(`${API_URL}/get_classification/?image_hash=${imageHash}&check_progress=${checkProgress ? 1 : 0}`);
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
