
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying ARRI Rental items...');
    const items = await prisma.equipmentItem.findMany({
        where: {
            brand: 'ARRI Rental'
        }
    });

    console.log(`Found ${items.length} ARRI Rental items.`);
    items.forEach(item => {
        console.log(`- ${item.name} (${item.category}, ${item.subcategory})`);
    });

    console.log('\nChecking specifically for ALFA...');
    const alfas = items.filter(i => i.model.includes('ALFA'));
    console.log(`Found ${alfas.length} ALFA lenses.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
