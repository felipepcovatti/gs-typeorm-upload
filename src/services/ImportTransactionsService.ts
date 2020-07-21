import fs from 'fs';
import parse from 'csv-parse';
import { getRepository, Not, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

const csvParse = parse({
  from_line: 2,
});

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const csvTransactions: CsvTransaction[] = [];
    const categoriesTitles: string[] = [];
    const readStream = fs.createReadStream(filePath);
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    readStream.pipe(csvParse).on('data', row => {
      const [title, type, value, category_title] = row.map((cell: string) =>
        cell.trim(),
      );

      csvTransactions.push({
        title,
        type,
        value,
        category_title,
      });
      categoriesTitles.push(category_title);
    });

    await new Promise(resolve => readStream.on('end', resolve));

    const existingCategories = await categoriesRepository.find({
      where: { title: In(categoriesTitles) },
    });

    const existingCategoriesTitles = existingCategories.map(
      ({ title }) => title,
    );

    const newCategoriesTitles = categoriesTitles.filter((category, index) => {
      return (
        !existingCategoriesTitles.includes(category) &&
        categoriesTitles.indexOf(category) === index
      );
    });

    const createdCategories = categoriesRepository.create(
      newCategoriesTitles.map(newCategoryTitle => ({
        title: newCategoryTitle,
      })),
    );

    await categoriesRepository.save(createdCategories);

    const allCategories = [...createdCategories, ...existingCategories];

    const transactions = transactionsRepository.create(
      csvTransactions.map(({ title, value, category_title, type }) => {
        return {
          title,
          value,
          type,
          category: allCategories.find(
            category => category.title === category_title,
          ),
        };
      }),
    );

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
