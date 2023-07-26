import { Action, ActionType } from './actions';
import { ImageClassification } from '@/api/ImageClassification';

type State = {
  imageClassification: ImageClassification | null | undefined;
}

export const ImageClassificationReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.Get:
      return { ...state, imageClassification: action.payload };
    case ActionType.Create:
      return { ...state, imageClassification: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
};
