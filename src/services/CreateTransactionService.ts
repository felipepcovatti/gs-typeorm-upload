// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category: category_title,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const existingCategory = await categoriesRepository.findOne({
      where: { title: category_title },
    });

    let category_id = '';
    if (existingCategory) {
      category_id = existingCategory.id;
    } else {
      const category = categoriesRepository.create({
        title: category_title,
      });

      await categoriesRepository.save(category);

      category_id = category.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
