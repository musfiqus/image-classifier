import { ImageClassification } from "@/api/ImageClassification";

export enum ActionType {
  Get = 'GET',
  Create = 'CREATE',
}

interface GetAction {
  type: ActionType.Get;
  payload: ImageClassification | null | undefined;
}

interface CreateAction {
  type: ActionType.Create;
  payload: ImageClassification | null | undefined;
}

export type Action = GetAction | CreateAction;
