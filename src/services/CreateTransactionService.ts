import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (
      type === 'outcome' &&
      value > (await transactionsRepository.getBalance()).total
    ) {
      throw new AppError('Insufficient funds');
    }

    const existingCategory = await categoriesRepository.findOne({
      where: { title: category_title },
    });

    let category: Category;

    if (existingCategory) {
      category = existingCategory;
    } else {
      const createdCategory = categoriesRepository.create({
        title: category_title,
      });

      await categoriesRepository.save(createdCategory);

      category = createdCategory;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
