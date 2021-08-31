import IModel from './IModel.interface';
import { OrderModel } from './CartModel';

class EvaluationModel implements IModel {
  evaluationId: number;
  orderId: number;
  order: OrderModel;
  userId: number;
  score: string;
  remark: string;
}

export default EvaluationModel;
