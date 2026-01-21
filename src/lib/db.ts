import { PrismaClient } from '@prisma/client';
import { EquipmentItem, Kit } from '@/types';

// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || "file:./dev.db"
        }
    }
} as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function mapPrismaToEquipment(item: any): EquipmentItem {
    let recordingFormats = [];
    let technicalData = [];
    let labMetrics = undefined;

    try {
        if (item.recordingFormats) recordingFormats = JSON.parse(item.recordingFormats);
    } catch (e) {
        // failed to parse
    }

    try {
        if (item.technicalData) technicalData = JSON.parse(item.technicalData);
    } catch (e) {
        // failed to parse
    }

    try {
        if (item.labMetrics) labMetrics = JSON.parse(item.labMetrics);
    } catch (e) {
        // failed to parse
    }

    return {
        id: item.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        category: item.category as any,
        subcategory: item.subcategory || undefined,
        description: item.description,
        daily_rate_est: item.daily_rate_est,
        image_url: item.imageUrl || undefined,
        specs: {
            // Start with parsed specs_json if available
            ...(item.specs_json ? JSON.parse(item.specs_json) : {}),

            mount: item.mount || undefined,
            weight_kg: item.weight_kg || undefined,
            resolution: item.resolution || undefined,
            focal_length: item.focal_length || undefined,
            aperture: item.aperture || undefined,
            power_draw_w: item.power_draw_w || undefined,
            sensor_size: item.sensor_size || undefined,
            sensor_type: item.sensor_type || undefined,
            image_circle_mm: item.image_circle_mm || undefined,

            // New Lens Data Mapped
            close_focus_m: item.close_focus_m || undefined,
            front_diameter_mm: item.front_diameter_mm || undefined,
            length_mm: item.length_mm || undefined,
            squeeze: item.squeeze || undefined,
            sensor_coverage: item.sensor_coverage || undefined,

            // New Support Data
            payload_kg: item.payload_kg || undefined,

            recording_formats: recordingFormats.length > 0 ? recordingFormats : undefined
        },
        technical_data: technicalData.length > 0 ? technicalData : undefined,
        lab_metrics: labMetrics
    };
}

export const db = {
    equipment: {
        getAll: async (): Promise<EquipmentItem[]> => {
            const items = await prisma.equipmentItem.findMany();
            return items.map(mapPrismaToEquipment);
        },
        getById: async (id: string): Promise<EquipmentItem | undefined> => {
            const item = await prisma.equipmentItem.findUnique({ where: { id } });
            return item ? mapPrismaToEquipment(item) : undefined;
        },
        getByCategory: async (category: string): Promise<EquipmentItem[]> => {
            const items = await prisma.equipmentItem.findMany({ where: { category } });
            return items.map(mapPrismaToEquipment);
        },
        search: async (query: string): Promise<EquipmentItem[]> => {
            const items = await prisma.equipmentItem.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { brand: { contains: query } },
                        { model: { contains: query } }
                    ]
                }
            });
            return items.map(mapPrismaToEquipment);
        },
        create: async (data: Omit<EquipmentItem, 'id'>) => {
            return prisma.equipmentItem.create({
                data: {
                    name: data.name,
                    brand: data.brand,
                    model: data.model,
                    category: data.category,
                    subcategory: data.subcategory,
                    description: data.description,
                    daily_rate_est: data.daily_rate_est,
                    imageUrl: data.image_url,

                    // Flatten specs
                    mount: data.specs.mount,
                    weight_kg: data.specs.weight_kg,
                    resolution: data.specs.resolution,
                    focal_length: data.specs.focal_length,
                    aperture: data.specs.aperture,
                    power_draw_w: data.specs.power_draw_w,
                }
            });
        },
        delete: async (id: string) => {
            return prisma.equipmentItem.delete({
                where: { id }
            });
        }
    },
    kits: {
        create: async (data: { name: string; items: { id: string; quantity: number }[] }) => {
            return prisma.kit.create({
                data: {
                    name: data.name,
                    items: {
                        create: data.items.map(i => ({
                            quantity: i.quantity,
                            equipment: { connect: { id: i.id } }
                        }))
                    }
                },
                include: { items: { include: { equipment: true } } }
            });
        }
    }
};
