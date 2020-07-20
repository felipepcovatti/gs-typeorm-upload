import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (transaction) {
      await transactionsRepository.delete(id);
    } else {
      throw new AppError('Entity not found');
    }
  }
}

export default DeleteTransactionService;
